import os
import logging
import threading
from dotenv import load_dotenv
from openai import OpenAI
from utils import process_split, parse_args

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


if __name__ == "__main__":
    args = parse_args()

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
