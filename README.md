# ERC404Wrapper

A first attempt at making a wrapper for existing erc721 to erc404.
Not ready for production.
Test file provides an example of wrapping and unwrapping BAYC into erc404 on forked ethereum mainnet.

Functionality:
- wrap by selecting array of owned erc721s to wrap and get erc404 equivalent
- erc721s stored in wrapper contract
- unwrap by selecting array of erc721s in wrapper contract, put in erc404 equivalent and get erc721s out

ToDo:
- explore whats happening when an erc404 gets sent to user (eg. which id are they receiving)
