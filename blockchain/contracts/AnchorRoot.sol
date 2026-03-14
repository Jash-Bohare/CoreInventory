// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AnchorRoot {

    struct Anchor {
        bytes32 root;
        uint256 timestamp;
    }

    Anchor[] public anchors;

    event RootAnchored(bytes32 root, uint256 timestamp);

    function anchor(bytes32 root) public {

        anchors.push(Anchor(root, block.timestamp));

        emit RootAnchored(root, block.timestamp);
    }

    function getAnchor(uint256 index) public view returns (bytes32, uint256) {

        Anchor memory a = anchors[index];

        return (a.root, a.timestamp);
    }

}