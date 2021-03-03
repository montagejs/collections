class Node {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
        this.inorderD = [];
        this.postorderD = [];
        this.preorderD= [];
    }

    insert(data) {

        var newNode = new Node(data);
        if (this.root === null)
            this.root = newNode;
        else
            this.insertNode(this.root, newNode);
    }
    insertNode(node, newNode) {

        if (newNode.data < node.data) {

            if (node.left === null)
                node.left = newNode;
            else
                this.insertNode(node.left, newNode);
        } else {

            if (node.right === null)
                node.right = newNode;
            else
                this.insertNode(node.right, newNode);
        }
    }

    remove(data) {
        this.root = this.removeNode(this.root, data);
    }

    removeNode(node, key) {

        if (node === null)
            return null;
        else if (key < node.data) {
            node.left = this.removeNode(node.left, key);
            return node;
        } else if (key > node.data) {
            node.right = this.removeNode(node.right, key);
            return node;
        } else {
            if (node.left === null && node.right === null) {
                node = null;
                return node;
            }
            if (node.left === null) {
                node = node.right;
                return node;
            } else if (node.right === null) {
                node = node.left;
                return node;
            }
            var aux = this.findMinNode(node.right);
            node.data = aux.data;

            node.right = this.removeNode(node.right, aux.data);
            return node;
        }

    }
    findMinNode(node) {

        if (node.left === null)
            return node;
        else
            return this.findMinNode(node.left);
    }
    getRootNode() {
        return this.root;
    }
    search(node, data) {

        if (node === null)
            return null;

        else if (data < node.data)
            return this.search(node.left, data);
        else if (data > node.data)
            return this.search(node.right, data);
        else
            return node;
    }
    getPreOrder(node) {
        if (node != null) {
            this.preorderD.push(node.data);
            this.getPreOrder(node.left);
            this.getPreOrder(node.right);
        }
    }
    getPostOrder(node) {
        if (node != null) {
            this.getPostOrder(node.left);
            this.getPostOrder(node.right);
            this.postorderD.push(node.data);
        }
    }
    getInOrder(node) {
        if (node !== null) {
            this.getInOrder(node.left);
            this.inorderD.push(node.data);
            this.getInOrder(node.right);
        }
    }

    inorder(node){
        this.getInOrder(node);
        return this.inorderD;
    }

    preOrder(node){
        this.getPreOrder(node);
        return this.preorderD;
    }

    postOrder(node){
        this.getPostOrder(node);
        return this.postorderD;
    }
}


module.exports = BinarySearchTree;
