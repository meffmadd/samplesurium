import os
import logging
import tempfile
import subprocess
from utils import process_split, parse_args, validate_answer_file

logger = logging.getLogger(__name__)


def process(text: str, question: str, options: list[str]) -> int:
    with tempfile.TemporaryDirectory() as temp_dir:
        knowledge_file = os.path.join(temp_dir, "knowledge.pl")
        answer_file = os.path.join(temp_dir, "answer.json")

        prompt = (
            f"Convert the following context into Prolog facts and rules. "
            f"Write the Prolog code to a file called knowledge.pl. "
            f"Context: {text}\n\n"
            f"Then answer this question: {question}\n\n"
            f"Options:\n"
            + "\n".join([f"{i}. {opt}" for i, opt in enumerate(options)])
            + '\n\nReturn ONLY the correct option index (0-based) and write it to a file called answer.json as {"answer": index}. '
            'The answer.json file must pass validation: it should be a valid JSON object with a single key "answer" containing an integer value.'
        )

        try:
            result = subprocess.run(
                ["opencode", "run", prompt],
                capture_output=True,
                text=True,
                timeout=60,
            )

            if not os.path.exists(knowledge_file):
                logger.error(f"knowledge.pl file not created by opencode")
                return -1

            return validate_answer_file(answer_file)

        except subprocess.TimeoutExpired:
            logger.error("Prolog subprocess timeout")
            return -1
        except Exception as e:
            logger.error(f"Error type: {type(e).__name__}: {e}")
            return -1


if __name__ == "__main__":
    args = parse_args()

    if args.reset:
        output_file = f"./opencode/{args.split}.jsonl"
        if os.path.exists(output_file):
            os.remove(output_file)
            print(f"Deleted existing output file: {output_file}")

    try:
        process_split(
            args.split, process, concurrency=args.concurrency, output_dir="./opencode"
        )
    except KeyboardInterrupt:
        print("\nStopping execution.")
