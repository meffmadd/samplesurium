import os
import argparse
import logging
import json
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm


logger = logging.getLogger(__name__)


def result_generator(process_func, df):
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing"):
        result = process_func(row["text"], row["question"], row["options"])
        yield result


def process_split(split, process_func, concurrency=1, output_dir="./oneshot"):
    from ProLogiQA.data import load

    # Load data based on split
    df = load(split=split)

    # Create output directory if it doesn't exist
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


def parse_args():
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

    return args
