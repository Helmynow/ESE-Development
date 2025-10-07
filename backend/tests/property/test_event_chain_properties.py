from hypothesis import given, strategies as st

from backend.app.events.chain import DomainEvent, EventChain


def event_strategy() -> st.SearchStrategy[DomainEvent]:
    return st.builds(
        DomainEvent,
        name=st.text(min_size=1),
        payload=st.dictionaries(keys=st.text(min_size=1), values=st.text(), max_size=3),
    )


@given(st.lists(event_strategy(), min_size=1, max_size=10))
def test_event_chain_preserves_order(events: list[DomainEvent]) -> None:
    chain = EventChain()
    for event in events:
        chain.publish(event)

    drained = chain.drain()

    assert drained == events


@given(st.lists(event_strategy(), max_size=5))
def test_event_chain_iterates_once(events: list[DomainEvent]) -> None:
    chain = EventChain(events)
    first_iter = list(chain)
    second_iter = list(chain)

    assert first_iter == events
    assert second_iter == []
