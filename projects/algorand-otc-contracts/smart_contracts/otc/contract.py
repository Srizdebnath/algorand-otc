import beaker
import pyteal as pt
from pyteal import abi

# Use a class to define the application state
class AppState:
    maker_address: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.bytes
    )
    asset_a_id: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64
    )
    asset_a_amount: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64
    )
    asset_b_id: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64
    )
    asset_b_amount: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64
    )
    taker_address: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.bytes, default=pt.Bytes("")
    )
    offer_expiration_round: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64
    )
    is_swap_complete: beaker.GlobalStateValue = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64, default=pt.Int(0)
    )

# Create the application, passing in the state class
app = beaker.Application("OTCDapp", state=AppState())

@app.create
def create(
    asset_a: abi.Asset,
    asset_a_amount: abi.Uint64,
    asset_b: abi.Asset,
    asset_b_amount: abi.Uint64,
    expiration_rounds: abi.Uint64,
    taker_address: abi.Address,
) -> pt.Expr:
    return pt.Seq(
        app.state.maker_address.set(pt.Txn.sender()),
        app.state.asset_a_id.set(asset_a.asset_id()),
        app.state.asset_a_amount.set(asset_a_amount.get()),
        app.state.asset_b_id.set(asset_b.asset_id()),
        app.state.asset_b_amount.set(asset_b_amount.get()),
        app.state.offer_expiration_round.set(
            pt.Add(pt.Global.round(), expiration_rounds.get())
        ),
        pt.If(taker_address.get() != pt.Global.zero_address()).Then(
            app.state.taker_address.set(taker_address.get())
        ),
    )

@app.opt_in
def opt_in_asset_b(asset_b: abi.Asset) -> pt.Expr:
    return pt.Seq(
        pt.Assert(pt.Txn.sender() == app.state.maker_address.get()),
        pt.Assert(asset_b.asset_id() == app.state.asset_b_id.get()),
        pt.InnerTxnBuilder.Begin(),
        pt.InnerTxnBuilder.SetField(pt.TxnField.type_enum, pt.TxnType.AssetTransfer),
        pt.InnerTxnBuilder.SetField(pt.TxnField.xfer_asset, asset_b.asset_id()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_receiver, pt.Global.current_application_address()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_amount, pt.Int(0)),
        pt.InnerTxnBuilder.SetField(pt.TxnField.fee, pt.Int(0)),
        pt.InnerTxnBuilder.Submit(),
    )

@app.external
def accept(taker_asset_transfer: abi.AssetTransferTransaction) -> pt.Expr:
    return pt.Seq(
        pt.Assert(app.state.is_swap_complete.get() == pt.Int(0)),
        pt.Assert(pt.Global.round() < app.state.offer_expiration_round.get()),
        pt.If(app.state.taker_address.get() != pt.Bytes("")).Then(
            pt.Assert(pt.Txn.sender() == app.state.taker_address.get())
        ),
        pt.Assert(pt.Txn.sender() != app.state.maker_address.get()),
        pt.Assert(
            taker_asset_transfer.get().asset_receiver()
            == pt.Global.current_application_address()
        ),
        pt.Assert(
            taker_asset_transfer.get().xfer_asset()
            == app.state.asset_b_id.get()
        ),
        pt.Assert(
            taker_asset_transfer.get().asset_amount()
            == app.state.asset_b_amount.get()
        ),
        # Swap A to Taker
        pt.InnerTxnBuilder.Begin(),
        pt.InnerTxnBuilder.SetField(pt.TxnField.type_enum, pt.TxnType.AssetTransfer),
        pt.InnerTxnBuilder.SetField(pt.TxnField.xfer_asset, app.state.asset_a_id.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_receiver, pt.Txn.sender()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_amount, app.state.asset_a_amount.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.fee, pt.Int(0)),
        pt.InnerTxnBuilder.Submit(),
        # Swap B to Maker
        pt.InnerTxnBuilder.Begin(),
        pt.InnerTxnBuilder.SetField(pt.TxnField.type_enum, pt.TxnType.AssetTransfer),
        pt.InnerTxnBuilder.SetField(pt.TxnField.xfer_asset, app.state.asset_b_id.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_receiver, app.state.maker_address.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_amount, app.state.asset_b_amount.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.fee, pt.Int(0)),
        pt.InnerTxnBuilder.Submit(),
        app.state.is_swap_complete.set(pt.Int(1)),
    )

@app.external
def reclaim_assets() -> pt.Expr:
    return pt.Seq(
        pt.Assert(app.state.is_swap_complete.get() == pt.Int(0)),
        pt.Assert(pt.Global.round() >= app.state.offer_expiration_round.get()),
        pt.Assert(pt.Txn.sender() == app.state.maker_address.get()),
        pt.InnerTxnBuilder.Begin(),
        pt.InnerTxnBuilder.SetField(pt.TxnField.type_enum, pt.TxnType.AssetTransfer),
        pt.InnerTxnBuilder.SetField(pt.TxnField.xfer_asset, app.state.asset_a_id.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_receiver, app.state.maker_address.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.asset_amount, app.state.asset_a_amount.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.fee, pt.Int(0)),
        pt.InnerTxnBuilder.Submit(),
    )

@app.delete
def delete() -> pt.Expr:
    return pt.Seq(
        pt.Assert(pt.Txn.sender() == app.state.maker_address.get()),
        pt.InnerTxnBuilder.Begin(),
        pt.InnerTxnBuilder.SetField(pt.TxnField.type_enum, pt.TxnType.Payment),
        pt.InnerTxnBuilder.SetField(pt.TxnField.receiver, app.state.maker_address.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.amount, pt.Int(0)),
        pt.InnerTxnBuilder.SetField(pt.TxnField.close_remainder_to, app.state.maker_address.get()),
        pt.InnerTxnBuilder.SetField(pt.TxnField.fee, pt.Int(0)),
        pt.InnerTxnBuilder.Submit(),
    )