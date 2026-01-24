import seaborn as sns
import matplotlib.pyplot as plt
from typing import Literal, Tuple
from ProLogiQA.data import load
from collections import Counter

# Set style
sns.set_style("whitegrid")
plt.rcParams["font.size"] = 12


def plot_type_distribution(
    split: Literal["train", "dev", "test"] = "train",
) -> Tuple[plt.Figure, plt.Axes]:
    """Create a beautiful seaborn plot of the 'type' column distribution.

    Args:
        split: Data split to use ('train', 'dev', or 'test')

    Returns:
        Tuple of (fig, ax) from matplotlib
    """
    df = load(split=split)

    # Extract reasoning types from the nested dictionaries
    reasoning_types = []
    for type_dict in df["type"]:
        for reason_type, is_present in type_dict.items():
            if is_present:
                reasoning_types.append(reason_type)

    # Create figure with better proportions
    fig, ax = plt.subplots(figsize=(10, 8))

    type_counts = Counter(reasoning_types)
    sorted_types = [item[0] for item in type_counts.most_common()]

    # Create beautiful count plot
    sns.countplot(
        y=reasoning_types,
        order=sorted_types,
        hue=reasoning_types,
        palette="viridis",
        legend=False,
        ax=ax,
    )
    ax.set_xlabel("Count", fontsize=14)
    ax.set_ylabel("Reasoning Type", fontsize=14)

    # Add value labels on bars
    for i, count in enumerate([type_counts[t] for t in sorted_types]):
        ax.text(count + 0.1, i, str(count), va="center", fontsize=11, fontweight="bold")

    # Remove spines for cleaner look
    sns.despine(left=True, bottom=True)

    plt.tight_layout()
    return fig, ax


if __name__ == "__main__":
    fig, ax = plot_type_distribution("train")
    plt.savefig("type_distribution.png", dpi=300, bbox_inches="tight")
    print("Plot saved as type_distribution.png")
    plt.show()
