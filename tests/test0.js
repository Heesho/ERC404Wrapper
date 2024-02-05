const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const divDec6 = (amount, decimals = 6) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");
const axios = require("axios");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const AddressZero = "0x0000000000000000000000000000000000000000";
const one = convert("1", 18);
const four = convert("4", 18);

function timer(t) {
  return new Promise((r) => setTimeout(r, t));
}

const provider = new ethers.providers.getDefaultProvider(
  "http://127.0.0.1:8545/"
);

const SCAN_API_KEY = process.env.SCAN_API_KEY || "";

const BAYC_ADDR = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
const BAYC_URL = `https://api.etherscan.io/api?module=contract&action=getabi&address=${BAYC_ADDR}&apikey=${SCAN_API_KEY}`;
const BAYC_HOLDER_0 = "0xF22742F06e4F6d68A8d0B49b9F270bB56affAB38";

let owner, multisig, treasury, user0, user1, user2;
let wrapper, bayc;

describe("local: test0", function () {
  before("Initial set up", async function () {
    console.log("Begin Initialization");

    [owner, multisig, treasury, user0, user1, user2] =
      await ethers.getSigners();

    // BAYC
    let response = await axios.get(BAYC_URL);
    const BAYC_ABI = JSON.parse(response.data.result);
    bayc = new ethers.Contract(BAYC_ADDR, BAYC_ABI, provider);
    await timer(1000);
    console.log("- BAYC Initialized");

    const wrapperArtifact = await ethers.getContractFactory("ERC404Wrapper");
    wrapper = await wrapperArtifact.deploy(BAYC_ADDR);
    console.log("- Wrapper Initialized");

    console.log("- System set up");

    console.log("Initialization Complete");
    console.log();
  });

  it("Impersonate BAYC holder and send to user0", async function () {
    console.log("******************************************************");
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [BAYC_HOLDER_0],
    });
    const signer = ethers.provider.getSigner(BAYC_HOLDER_0);

    let id0 = await bayc.connect(owner).tokenOfOwnerByIndex(BAYC_HOLDER_0, 0);
    await bayc.connect(signer).transferFrom(BAYC_HOLDER_0, user0.address, id0);
    let id1 = await bayc.connect(owner).tokenOfOwnerByIndex(BAYC_HOLDER_0, 0);
    await bayc.connect(signer).transferFrom(BAYC_HOLDER_0, user0.address, id1);
    let id2 = await bayc.connect(owner).tokenOfOwnerByIndex(BAYC_HOLDER_0, 0);
    await bayc.connect(signer).transferFrom(BAYC_HOLDER_0, user0.address, id2);
    let id3 = await bayc.connect(owner).tokenOfOwnerByIndex(BAYC_HOLDER_0, 0);
    await bayc.connect(signer).transferFrom(BAYC_HOLDER_0, user0.address, id3);

    console.log(
      "Holder BAYC balance: ",
      await bayc.connect(owner).balanceOf(BAYC_HOLDER_0)
    );
    console.log(
      "User0 BAYC balance: ",
      await bayc.connect(owner).balanceOf(user0.address)
    );
  });

  it("Data: User0", async function () {
    console.log("******************************************************");
    console.log("BAYC");
    let nftBalance = await bayc.connect(owner).balanceOf(user0.address);
    console.log("NFT balance: ", nftBalance);
    for (let i = 0; i < nftBalance; i++) {
      console.log(
        await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, i)
      );
    }
    console.log("wBAYC");
    console.log(
      "ERC20 Balance: ",
      divDec(await wrapper.balanceOf(user0.address))
    );
  });

  it("User0 deposits 1 BAYC in Wrapper", async function () {
    console.log("******************************************************");
    console.log(divDec(await wrapper.balanceOf(wrapper.address)));
    let id0 = await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, 0);
    await bayc.connect(user0).approve(wrapper.address, id0);
    await wrapper.connect(user0).deposit([id0]);
    console.log(divDec(await wrapper.balanceOf(wrapper.address)));
  });

  it("Data: User0", async function () {
    console.log("******************************************************");
    console.log("BAYC");
    let nftBalance = await bayc.connect(owner).balanceOf(user0.address);
    console.log("NFT balance: ", nftBalance);
    for (let i = 0; i < nftBalance; i++) {
      console.log(
        await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, i)
      );
    }
    console.log("wBAYC");
    console.log(
      "ERC20 Balance: ",
      divDec(await wrapper.balanceOf(user0.address))
    );
  });

  it("User0 withdraws 1 BAYC from Wrapper", async function () {
    console.log("******************************************************");
    let id0 = await bayc.connect(owner).tokenOfOwnerByIndex(wrapper.address, 0);
    await wrapper.connect(user0).approve(wrapper.address, one);
    await wrapper.connect(user0).withdraw([id0]);
  });

  it("Data: User0", async function () {
    console.log("******************************************************");
    console.log("BAYC");
    let nftBalance = await bayc.connect(owner).balanceOf(user0.address);
    console.log("NFT balance: ", nftBalance);
    for (let i = 0; i < nftBalance; i++) {
      console.log(
        await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, i)
      );
    }
    console.log("wBAYC");
    console.log(
      "ERC20 Balance: ",
      divDec(await wrapper.balanceOf(user0.address))
    );
  });

  it("User0 deposits 4 BAYC in Wrapper", async function () {
    console.log("******************************************************");
    console.log(divDec(await wrapper.balanceOf(wrapper.address)));
    let id0 = await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, 0);
    let id1 = await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, 1);
    let id2 = await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, 2);
    let id3 = await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, 3);
    await bayc.connect(user0).approve(wrapper.address, id0);
    await bayc.connect(user0).approve(wrapper.address, id1);
    await bayc.connect(user0).approve(wrapper.address, id2);
    await bayc.connect(user0).approve(wrapper.address, id3);
    await wrapper.connect(user0).deposit([id0, id1, id2, id3]);
    console.log(divDec(await wrapper.balanceOf(wrapper.address)));
  });

  it("Data: User0", async function () {
    console.log("******************************************************");
    console.log("BAYC");
    let nftBalance = await bayc.connect(owner).balanceOf(user0.address);
    console.log("NFT balance: ", nftBalance);
    for (let i = 0; i < nftBalance; i++) {
      console.log(
        await bayc.connect(owner).tokenOfOwnerByIndex(user0.address, i)
      );
    }
    console.log("wBAYC");
    console.log(
      "ERC20 Balance: ",
      divDec(await wrapper.balanceOf(user0.address))
    );
  });

  it("User0 withdraws 4 BAYC from Wrapper", async function () {
    console.log("******************************************************");
    let id0 = await bayc.connect(owner).tokenOfOwnerByIndex(wrapper.address, 0);
    let id1 = await bayc.connect(owner).tokenOfOwnerByIndex(wrapper.address, 1);
    let id2 = await bayc.connect(owner).tokenOfOwnerByIndex(wrapper.address, 2);
    let id3 = await bayc.connect(owner).tokenOfOwnerByIndex(wrapper.address, 3);
    await wrapper.connect(user0).approve(wrapper.address, four);
    await wrapper.connect(user0).withdraw([id0, id1, id2, id3]);
  });
});
