import os
import argparse
from dotenv import load_dotenv
from openai import OpenAI
from tqdm import tqdm

load_dotenv()

client = OpenAI()

model = os.getenv("MODEL", "")


def process(text: str, question: str, options: list[str]) -> int:
    from pydantic import BaseModel

    class Answer(BaseModel):
        choice: int

    response = client.chat.completions.parse(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Answer the multiple choice question based on the given context. Return the index of the correct option (0-based).",
            },
            {
                "role": "user",
                "content": f"Context: {text}\n\nQuestion: {question}\n\nOptions:\n"
                + "\n".join([f"{i}. {opt}" for i, opt in enumerate(options)]),
            },
        ],
        response_format=Answer,
    )

    answer = response.choices[0].message.parsed
    return answer.choice if answer else -1


def result_generator(process_func, df):
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing"):
        result = process_func(row["text"], row["question"], row["options"])
        yield result


def process_split(split, process_func):
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

    # Process data and write incrementally as JSONL
    with open(output_file, "a") as f:
        # Process each row and write immediately
        for (_, row), result in zip(df.iterrows(), result_generator(process_func, df)):
            json_line = {"id": row["id"], "result": result}
            f.write(json.dumps(json_line) + "\n")
            f.flush()  # Ensure data is written to disk immediately

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

    args = parser.parse_args()

    # If reset flag is set, delete the output file
    if args.reset:
        output_file = f"./oneshot/{args.split}.jsonl"
        if os.path.exists(output_file):
            os.remove(output_file)
            print(f"Deleted existing output file: {output_file}")

    # Process the specified split with process function
    try:
        process_split(args.split, process)
    except KeyboardInterrupt:
        print("\nStopping execution.")
