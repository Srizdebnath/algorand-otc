import logging
import algokit_utils

logger = logging.getLogger(__name__)

def deploy() -> None:
    from smart_contracts.artifacts.otc.otc_swap_client import OtcFactory

    # load Algorand client and deployer account
    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    # prepare app factory
    factory = algorand.client.get_typed_app_factory(
        OtcFactory, default_sender=deployer_.address
    )

    # deploy the contract
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    # fund the app with 1 Algo if newly created or replaced
    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    # Call your real method instead of hello
    response = app_client.send.create_application(
        asset_a=1234,  # replace with actual ASA ID
        asset_a_amount=1000,
        asset_b=5678,  # replace with actual ASA ID
        asset_b_amount=2000,
        expiry_rounds=50,
        taker=deployer_.address,
    )
    logger.info(f"Deployed OTC Swap App ID={app_client.app_id}, response={response}")
