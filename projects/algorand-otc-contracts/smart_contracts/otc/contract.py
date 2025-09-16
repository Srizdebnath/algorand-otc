from algopy import *
from algopy.arc4 import abimethod


class OTCSwap(ARC4Contract):
    # State variables
    maker: Account
    taker: Account
    asset_a: Asset
    asset_a_amount: UInt64
    asset_b: Asset
    asset_b_amount: UInt64
    offer_expiry: UInt64
    is_completed: bool

    # Create application
    @abimethod(allow_actions=["NoOp"], create="require")
    def create_application(
        self,
        asset_a: Asset,
        asset_a_amount: UInt64,
        asset_b: Asset,
        asset_b_amount: UInt64,
        expiry_rounds: UInt64,
        taker: Account,
    ) -> None:
        self.maker = Txn.sender
        self.asset_a = asset_a
        self.asset_a_amount = asset_a_amount
        self.asset_b = asset_b
        self.asset_b_amount = asset_b_amount
        self.offer_expiry = Global.round + expiry_rounds
        self.taker = taker
        self.is_completed = False

    # Accept offer (taker deposits Asset B, swap executes)
    @abimethod()
    def accept_offer(self, taker_transfer: gtxn.AssetTransferTransaction) -> None:
        assert not self.is_completed, "Swap already completed"
        assert Global.round < self.offer_expiry, "Offer expired"
        if self.taker != Global.zero_address:
            assert Txn.sender == self.taker, "Only assigned taker can accept"
        assert Txn.sender != self.maker, "Maker cannot accept own offer"

        # Check taker transfer
        assert taker_transfer.asset_receiver == Global.current_application_address, "Must send to app"
        assert taker_transfer.xfer_asset == self.asset_b, "Wrong asset sent"
        assert taker_transfer.asset_amount == self.asset_b_amount, "Wrong amount sent"

        # Send Asset A to taker
        itxn.AssetTransfer(
            xfer_asset=self.asset_a,
            asset_receiver=Txn.sender,
            asset_amount=self.asset_a_amount,
            fee=1_000,
        ).submit()

        # Send Asset B to maker
        itxn.AssetTransfer(
            xfer_asset=self.asset_b,
            asset_receiver=self.maker,
            asset_amount=self.asset_b_amount,
            fee=1_000,
        ).submit()

        self.is_completed = True

    # Reclaim Asset A if offer expires (maker only)
    @abimethod()
    def reclaim_assets(self) -> None:
        assert not self.is_completed, "Swap already completed"
        assert Global.round >= self.offer_expiry, "Offer not expired"
        assert Txn.sender == self.maker, "Only maker can reclaim"

        # Refund Asset A to maker
        itxn.AssetTransfer(
            xfer_asset=self.asset_a,
            asset_receiver=self.maker,
            asset_amount=self.asset_a_amount,
            fee=1_000,
        ).submit()

        self.is_completed = True

    # Delete app (maker only, after completion)
    @abimethod(allow_actions=["DeleteApplication"])
    def delete_application(self) -> None:
        assert self.is_completed, "Swap must be completed or expired"
        assert Txn.sender == self.maker, "Only maker can delete"


