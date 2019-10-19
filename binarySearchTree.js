class node {

    nodeVlaue = null;
    rightNode = null;
    leftNode = null;

    constructor(value) {
        if(value instanceof Number) {
            this.nodeVlaue = value;
        } else throw new Error("Value Should be Number");
    }
}


class BinarySearhTree {
    

    constructor() {
        node = new node();
    }

    insert(value) {
        if(value instanceof Number) {
            
        } else throw new Error("Value Should be Number");

    }

    delete(value) {

    }

    search(value) {

    }


}