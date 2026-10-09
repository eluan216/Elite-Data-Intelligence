from scipy.stats import spearmanr

from src.data import generate_items
from src.model import PriorityScorer
from src.train_eval import top_k_capture


def test_fit_and_score_range():
    items, impacts = generate_items(n=200, seed=1)
    model = PriorityScorer().fit(items, impacts)
    s = model.score(items[0])
    assert 0.0 <= s <= 1.0


def test_determinism():
    items, impacts = generate_items(n=100, seed=2)
    model = PriorityScorer().fit(items, impacts)
    a = model.score(items[3])
    b = model.score(items[3])
    assert a == b


def test_demo_metric_targets():
    items, impacts = generate_items(n=600, seed=3)
    split = int(0.7 * len(items))
    model = PriorityScorer().fit(items[:split], impacts[:split])
    scores = model.score_many(items[split:])
    y = impacts[split:]
    rho, _ = spearmanr(scores, y)
    capture = top_k_capture(scores, y, 0.2)
    assert rho >= 0.70
    assert capture >= 0.40
