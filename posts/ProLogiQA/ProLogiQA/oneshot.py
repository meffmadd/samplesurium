import os
import argparse
import logging
import threading
from dotenv import load_dotenv
from openai import OpenAI
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed

# logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

model = os.getenv("MODEL", "")

# Thread-local storage for OpenAI clients
_thread_local = threading.local()


def get_client() -> OpenAI:
    """Get a thread-local OpenAI client instance."""
    if not hasattr(_thread_local, "client"):
        _thread_local.client = OpenAI()
    return _thread_local.client


def process(text: str, question: str, options: list[str]) -> int:
    from pydantic import BaseModel

    class Answer(BaseModel):
        answer: int

    try:
        client = get_client()
        response = client.chat.completions.parse(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": f"You are a helpful assistant. Answer the multiple choice question based on the given context. Return the index of the correct option (0-based): {Answer(answer=0).model_dump_json()}",
                },
                {
                    "role": "user",
                    "content": f"Context: {text}\n\nQuestion: {question}\n\nOptions:\n"
                    + "\n".join([f"{i}. {opt}" for i, opt in enumerate(options)]),
                },
            ],
            max_completion_tokens=32768,
            response_format=Answer,
        )

        answer = response.choices[0].message.parsed
        return answer.answer if answer else -1
    except Exception as e:
        logger.error(f"Error type: {type(e).__name__}")
        return -1


def result_generator(process_func, df):
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing"):
        result = process_func(row["text"], row["question"], row["options"])
        yield result


def process_split(split, process_func, concurrency=1):
    from ProLogiQA.data import load
    import json

    # Load data based on split
    df = load(split=split)

    # Create output directory if it doesn't exist
    output_dir = "./oneshot"
    os.makedirs(output_dir, exist_ok=True)

    # Prepare output file path
    output_file = os.path.join(output_dir, f"{split}.jsonl")

    # Check if output file exists and read processed IDs
    processed_ids = set()
    if os.path.exists(output_file):
        with open(output_file, "r") as f:
            for line in f:
                data = json.loads(line.strip())
                processed_ids.add(data["id"])

    # Filter out already processed IDs
    if processed_ids:
        df = df[~df["id"].isin(processed_ids)]
        print(
            f"Skipping {len(processed_ids)} already processed IDs, processing {len(df)} remaining"
        )

    # Thread-safe file writing
    file_lock = threading.Lock()

    # Process row function for parallel execution
    def process_row(row):
        result = process_func(row["text"], row["question"], row["options"])
        return {"id": row["id"], "result": result}

    # Process data and write incrementally as JSONL
    with open(output_file, "a") as f:
        if concurrency == 1:
            # Sequential processing for backwards compatibility
            for (_, row), result in zip(
                df.iterrows(), result_generator(process_func, df)
            ):
                if result != -1:
                    json_line = {"id": row["id"], "result": result}
                    f.write(json.dumps(json_line) + "\n")
                    f.flush()
        else:
            # Parallel processing with ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=concurrency) as executor:
                futures = {
                    executor.submit(process_row, row): row["id"]
                    for _, row in df.iterrows()
                }

                with tqdm(
                    total=len(futures), desc="Processing", dynamic_ncols=True
                ) as pbar:
                    for future in as_completed(futures):
                        json_line = future.result()
                        if json_line["result"] != -1:
                            with file_lock:
                                f.write(json.dumps(json_line) + "\n")
                                f.flush()
                        pbar.update(1)
                        pbar.refresh()

    print(f"Saved results to {output_file}")
    return output_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Process data splits with a processing function"
    )
    parser.add_argument(
        "split",
        choices=["train", "dev", "test"],
        help="Data split to process (train, dev, or test)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete the output file before starting processing",
    )
    parser.add_argument(
        "--concurrency",
        "-c",
        type=int,
        default=1,
        help="Number of parallel requests (default: 1)",
    )
    parser.add_argument(
        "--debug",
        "-d",
        action="store_true",
        help="Enable debug logging",
    )

    args = parser.parse_args()

    # Set debug logging if requested
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.setLevel(logging.DEBUG)

    # If reset flag is set, delete the output file
    if args.reset:
        output_file = f"./oneshot/{args.split}.jsonl"
        if os.path.exists(output_file):
            os.remove(output_file)
            print(f"Deleted existing output file: {output_file}")

    # Process the specified split with process function
    try:
        process_split(args.split, process, concurrency=args.concurrency)
    except KeyboardInterrupt:
        print("\nStopping execution.")
