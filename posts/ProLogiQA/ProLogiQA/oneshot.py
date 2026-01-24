import os
import time
import argparse
from dotenv import load_dotenv
from openai import OpenAI
from tqdm import tqdm

load_dotenv()

client = OpenAI()

model = os.getenv("MODEL")


def dummy_function():
    time.sleep(0.1)  # Add delay to simulate work
    return 0


def result_generator(process_func, df):
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing"):
        result = process_func()
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

    # Process the specified split with dummy function
    process_split(args.split, dummy_function)
