//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ERC404.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IERC404 {
    function setWhitelist(address _address, bool _value) external;
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external;
}


contract ERC404Wrapper is ERC404 {

    address public immutable collection;
    uint256[] public ids;
    mapping(uint256 => int256) public index_Id;

    constructor(
        address _collection
    ) ERC404(IERC721Metadata(_collection).name(), IERC721Metadata(_collection).symbol(), 18, IERC721Enumerable(_collection).totalSupply(), msg.sender) {
        collection = _collection;
        balanceOf[address(this)] = IERC721Enumerable(collection).totalSupply() * 1e18;
        whitelist[address(this)] = true;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return IERC721Metadata(collection).tokenURI(id);
    }

    function deposit(uint256[] calldata _ids) external {
        for (uint256 i = 0; i < _ids.length; i++) {
            ids.push(_ids[i]);
            index_Id[_ids[i]] = int256(ids.length - 1);
            IERC404(address(this)).transfer(msg.sender, 1e18);
            IERC721(collection).transferFrom(msg.sender, address(this), _ids[i]);
        }
    }

    function withdraw(uint256[] calldata _ids) external {
        for (uint256 i = 0; i < _ids.length; i++) {
            require(index_Id[_ids[i]] != -1, "ERC404Wrapper: id not found");
            _pop(uint256(index_Id[_ids[i]]));
            index_Id[_ids[i]] = -1;
            IERC404(address(this)).transferFrom(msg.sender, address(this), 1e18);
            IERC721(collection).transferFrom(address(this), msg.sender, _ids[i]);
        }
    }

    /** @dev Internal function to remove an unwanted index from an array */
    function _pop(uint256 _index) internal {
        uint256 tempID;
        uint256 swapID;

        if (ids.length > 1 && _index != ids.length - 1) {
            tempID = ids[_index];
            swapID = ids[ids.length - 1];
            ids[_index] = swapID;
            ids[ids.length - 1] = tempID;
            index_Id[swapID] = int256(_index);
            ids.pop();
        } else {
            ids.pop();
        }
    }

}