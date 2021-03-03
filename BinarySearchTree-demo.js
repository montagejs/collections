const bst = require('./binarySearchTree');

let BST = new bst();
BST.insert(5);
BST.insert(3);
BST.insert(6);
BST.insert(2);
BST.insert(10);
BST.insert(9);
BST.insert(32);
BST.insert(47);
BST.insert(59);
BST.insert(-4);
BST.insert(54);
BST.insert(6);

let root =  BST.getRootNode();
console.log(BST.inorder(root));
console.log(BST.postOrder(root));
console.log(BST.preOrder(root));
console.log(BST.search(root,6));
console.log(BST.search(root,11));
console.log(BST.search(root,0));


