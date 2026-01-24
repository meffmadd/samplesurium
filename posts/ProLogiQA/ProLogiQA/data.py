import pandas as pd
import os
from typing import Optional, Literal
from enum import Enum


class ReasoningType(Enum):
    CATEGORICAL = "Categorical Reasoning"
    CONJUNCTIVE = "Conjunctive Reasoning"
    DISJUNCTIVE = "Disjunctive Reasoning"
    NECESSARY_CONDITIONAL = "Necessry Condtional Reasoning"
    SUFFICIENT_CONDITIONAL = "Sufficient Conditional Reasoning"


def load(
    split: Literal["train", "dev", "test"], data_dir: Optional[str] = None
) -> pd.DataFrame:
    if split not in ["train", "dev", "test"]:
        raise ValueError(f"Invalid split '{split}'. Must be one of: train, dev, test")

    if data_dir is None:
        data_dir = os.path.join(os.path.dirname(__file__), "data")

    file_path = os.path.join(data_dir, f"{split}.txt")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Data file not found: {file_path}")

    df = pd.read_json(file_path, lines=True)

    # Create new boolean columns for each type
    types = [
        "Categorical Reasoning",
        "Conjunctive Reasoning",
        "Disjunctive Reasoning",
        "Necessry Condtional Reasoning",
        "Sufficient Conditional Reasoning",
    ]

    for type_name in types:
        df[type_name] = df["type"].apply(
            lambda x: x.get(type_name, False) if isinstance(x, dict) else False
        )

    # Drop the old type column
    df = df.drop("type", axis=1)

    return df


def filter_by_type(df: pd.DataFrame, reasoning_type: ReasoningType) -> pd.DataFrame:
    return pd.DataFrame(df[df[reasoning_type.value] == True])


if __name__ == "__main__":
    # Example usage
    df = load(split="train")
    print(f"Loaded {len(df)} samples from train split")
    print(f"Columns: {list(df.columns)}")
    print(f"Sample text: {df.iloc[0]['text'][:100]}...")
