import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { pairsString } from './txt.js';
import { Greek } from './greek.js';
import gradcap from './gradcap.png';
gradcap = {img: gradcap, width: .3, ratio: 6785 / 6321};

class Brother {
  static width = 1;
  static height = 3;

  constructor(name, big, roster, graduated, pc, renderSpecial) {
    this.name = name;
    this.big = big;
    this.littles = [];
    this.roster = roster;
    this.graduated = graduated;
    this.pc = pc;
    this.numDecs = null;
    this.numLivingDecs = null;
    this.tree = null;
    this.renderSpecial = (renderSpecial === undefined) ? false : renderSpecial;
  }

  addLittle(little) {
    this.littles.push(little)
  }

  calculateDecs() {
    this.numDecs = 0;
    for (let little of this.littles) {
      this.numDecs += 1 + ((little.numDecs === null) ? little.calculateDecs() : little.numDecs);
    }
    return this.numDecs;
  }

  calculateLivingDecs() {
    this.numLivingDecs = 0;
    for (let little of this.littles) {
      this.numLivingDecs += ((little.numLivingDecs === null) ? little.calculateLivingDecs() : little.numLivingDecs) + (little.graduated ? 0 : 1);
    }
    return this.numLivingDecs;
  }

  stepladder(trim) {
    var littles = this.littles.map(brother => {return brother.stepladder(trim);});
    if (trim === 2) {
      for (let i = littles.length - 1; i >= 0; i--) {
        if (this.littles[i].graduated && this.littles[i].numLivingDecs === 0) {
          littles = littles.slice(0, i).concat(littles.slice(i + 1));
        }
      }
    }
    const anyLittles = littles !== undefined && littles.length !== 0;
    const widths = littles.map(li => {return li.width});
    littles = littles.map(li => {return li.stepladder});

    var totalWidth = 0;
    for (let i of widths) {
      totalWidth += i;
    }

    return {
      "stepladder": (
      <li style={{display: "inline-block", verticalAlign: "top"}}>
        {/* <div style={{marginRight: "30px", border: "2px solid " + (this.graduated ? "gold" : "black"), width: "200px", height: "50px", textAlign: "center", verticalAlign: "middle", backgroundColor: getPCColor(this.pc), whiteSpace: "pre-wrap", marginBottom: "10px"}}>{this.name + ", " + ((Number.isInteger(this.roster)) ? (Greek.getText(this.pc, false) + " #" + this.roster.toString()) : "Transfer Student") + "\n" + this.numLivingDecs.toString() + "/" + this.numDecs.toString() + " Descendants Active"}</div> */}
        <div style={{marginRight: "30px", border: "2px solid " + ((this.pc % 2) === 1 ? "rgb(196,30,58)" : "rgb(173,165,135)"), width: "170px", height: "16px", textAlign: "center", verticalAlign: "middle", backgroundColor: getPCColor(this.pc), whiteSpace: "pre-wrap"}}>{this.name + (this.graduated ? " ★" : "")}</div>
        {drawSpouts2(widths)}
        {anyLittles ? <ul style={{listStyle: "none"}}>{littles}</ul> : ""}
      </li>
    ),
    "width" : anyLittles ? totalWidth : 1};
  }

  getWidth() {
    return Brother.width;
  }

  static extention;
  static extentionFlip;

  generateTree(trim, compaction, byPC) {
    var childTrees = [];
    var minChildPC = Infinity;
    if (byPC) {
      for (let bro of this.littles) {
        if (trim < 2 || !bro.graduated || bro.numLivingDecs > 0) {
          minChildPC = Math.min(minChildPC, bro.pc);
        }
      }
    }

    for (let bro of this.littles) {
      if (trim < 2 || !bro.graduated || bro.numLivingDecs > 0) {
        let child = bro.generateTree(trim, compaction, byPC);
        if (byPC) {
          for (let i = 0; i < bro.pc - minChildPC; i++) {
            child = treeVertConcat(Brother.extention, child);
          }
        }
        childTrees.push(child);
      }
    }

    var tree = organizeTrees(childTrees, compaction);

    if (tree.height === 0) {
      tree = new Tree([[this]]);
    } else {
      tree = treeVertConcat(new Tree([[new Branch(tree.spouts)]]), tree);
      if (byPC) {
        for (let i = 1; i < minChildPC - this.pc; i++) {
          tree = treeVertConcat(Brother.extentionFlip, tree);
        }
      }
      tree = treeVertConcat(new Tree([[this]]), tree);
    }
    this.tree = tree;
    return this.tree;
  }

  render() {
    const margin = Background.toPxWidth(0, Background.pxHeight / 2);
    const pcColor = getPCColor(this.pc);
    if (!this.renderSpecial) {
      if (this.pc !== null) return <ul><li style={{display: "inline-block"}}><div style={{width: Background.toPxWidth(Brother.width, -4-Background.pxHeight), marginLeft: margin, marginRight: margin, height: Background.toPxHeight(Brother.height, -4), backgroundColor: pcColor.backgroundColor, display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid " + pcColor.borderColor, whiteSpace: "pre-wrap", textAlign: "center"}}>
              {this.name}
            </div>
          </li>
          {this.graduated ? <li style={{width: 0, height: 0, display: "inline-block", position: "relative", right: Background.toPxWidth(gradcap.width * .59, Background.pxHeight / 2), bottom: Background.toPxWidth(gradcap.width / gradcap.ratio * .41)}}><img src={gradcap.img} alt="gradcap" width={Background.toPxWidth(gradcap.width)} height={Background.toPxWidth(gradcap.width / gradcap.ratio)} /></li> : ""}
        </ul>
      const pad = <div style={{display: "inline-block", width: Background.toPxWidth(Brother.width / 2, -1), height: Background.toPxHeight(Brother.height)}}></div>;
      return <ul>
        {pad}
        <div style={{display: "inline-block", width: Background.toPxWidth(0, 2), height: Background.toPxHeight(Brother.height), backgroundColor: "black"}}></div>
        {pad}
      </ul>
    }

    return <ul>
      <li style={{display: "inline-block"}}>
        {(this.pc === 0 && (this.roster === -1 || this.roster === null)) ? 
        <div style={{width: margin, height: Background.toPxHeight(Brother.height)}}></div> : 
        <ul>
          <div style={{width: Background.toPxWidth(0, Background.pxHeight), height: Background.toPxHeight(Brother.height / 2, -1)}}></div>
          <div style={{width: Background.toPxWidth(0, Background.pxHeight), height: Background.toPxHeight(0, 2), backgroundColor: "black"}}></div>
        </ul>}
      </li>
      <li style={{display: "inline-block"}}>
        <div style={{width: Background.toPxWidth(Brother.width, -4-Background.pxHeight), height: Background.toPxHeight(Brother.height, -4), backgroundColor: pcColor.backgroundColor, display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid " + pcColor.borderColor, whiteSpace: "pre-wrap", textAlign: "center"}}>
          {this.name}
        </div>
      </li>
      {this.graduated ? <li style={{width: 0, height: 0, display: "inline-block", position: "relative", right: Background.toPxWidth(gradcap.width * .59), bottom: Background.toPxWidth(gradcap.width / gradcap.ratio * .41)}}><img src={gradcap.img} alt="gradcap" width={Background.toPxWidth(gradcap.width)} height={Background.toPxWidth(gradcap.width / gradcap.ratio)} /></li> : ""}
    </ul>;
  }
}

class Tree {
  constructor (rows) {
    if (rows === undefined || rows === null || rows.length === 0) {
      this.rows = null;
      this.height = 0;
      this.width = 0;
      this.spouts = 0;
    } else {
      this.rows = rows;
      this.height = rows.length;
      this.width = 0;
      this.spouts = [];
      for (let elem of rows[0]) {
        if (elem instanceof Brother) {
          this.spouts.push(this.width);
        }
        this.width += elem.getWidth();
      }
    }
  }

  render() {
    return <ul>
      {this.rows.map(row => {
        var anyBrothers = false;
        for (let elem of row) {
          if (elem instanceof Brother) {
            anyBrothers = true;
            break;
          }
        }
        return <li style={{}}>
            <ul style={{height: Background.toPxHeight(anyBrothers? Brother.height : 1)}}>
              {row.map(elem => {return <li style={{display: "inline-block"}}>{elem.render()}</li>;})}
            </ul>
          </li>;
        })}
    </ul>
  }
}

class Blank {
  constructor(width) {
    this.width = (width === undefined || width === null) ? 1 : width;
  }

  getWidth() {
    return this.width;
  }

  render() {
    return <div style={{width: Background.toPxWidth(this.width), height: Background.toPxHeight(1), backgroundColor: ""}}>
        {/* {"blank" + this.width.toString()} */}
      </div>
  }
}

class Branch {
  constructor(spouts) {
    this.exists = spouts !== undefined;
    this.spouts = spouts;
    this.width = this.exists ? spouts[spouts.length - 1] + 1 : 1;
  }

  getWidth() {
    return this.width;
  }

  render() {
    const testColor = "";
    if (!this.exists) return <div style={{width: Background.toPxWidth(1), height: Background.toPxHeight(1)}}></div>;

    const out = [<li style={{display: "inline-block", width: Background.toPxWidth(Brother.width / 2, -1), height: Background.toPxHeight(1), backgroundColor: testColor}}></li>]
    out.push(<li style={{display: "inline-block", width: Background.toPxWidth(0, 2), height: Background.toPxHeight(1), backgroundColor: "black"}}></li>);

    function getPadding(num) {
      const tmp = <li style={{width: Background.toPxWidth(num, -2), height: Background.toPxHeight(.5, -1), backgroundColor: testColor}}></li>
      return <li style={{display: "inline-block", height: Background.toPxHeight(1)}}>
        <ul>
          {tmp}
          <li style={{width: Background.toPxWidth(num, -2), height: Background.toPxHeight(0, 2), backgroundColor: "black"}}></li>
          {tmp}
        </ul>
        </li>
    }
    function getSpout() {
      return <li style={{display: "inline-block", height: Background.toPxHeight(1)}}>
        <ul>
          <li style={{width: Background.toPxWidth(0, 2), height: Background.toPxHeight(.5, -1), backgroundColor: testColor}}></li>
          <li style={{width: Background.toPxWidth(0, 2), height: Background.toPxHeight(.5, 1), backgroundColor: "black"}}></li>
        </ul>
        </li>
    }
    for (let i = 1; i < this.spouts.length; i++) {
      out.push(getPadding(this.spouts[i] - this.spouts[i - 1]));
      out.push(getSpout());
    }

    return <ul style={{width: Background.toPxWidth(this.width), height: Background.toPxHeight(1)}}>
        {out}
      </ul>
  }
}

class Background extends React.Component {
  constructor(props) {
    super(props);
    this.allBrothers = getBrothers();
    this.gcas = this.allBrothers.gcas;
    this.allBrothers = this.allBrothers.rest;
    this.curBrothers = [];
    this.maxPC = 0;
    for (const brother of this.allBrothers) {
      if (brother.big === null) {
        this.curBrothers.push(brother);
      }
      this.maxPC = Math.max(this.maxPC, brother.pc);
    }
    let grads = new Array(this.maxPC).fill(true);
    for (let brother of this.allBrothers) {
      grads[brother.pc] &= brother.graduated;
    }

    this.pcList = new Array(this.maxPC);
    this.pcList[0] = new Brother(Greek.getText(0, true), null, null, null, 0, false);
    for (let i = 1; i <= this.maxPC; i++) {
      this.pcList[i] = new Brother(Greek.getText(i, true), this.pcList[i - 1], null, grads[i], i, false);
      this.pcList[i - 1].addLittle(this.pcList[i]);
    }
    this.pcList[0].generateTree(0, 0, true);

    Brother.extention = new Tree([[new Brother(null, null, null, null, null)], [new Branch([0])]]);
    Brother.extentionFlip = new Tree([[new Branch([0])], [new Brother(null, null, null, null, null)]]);

    this.trim = 1;
    this.compaction = 2;
    this.byPC = false;

    for (let bro of this.curBrothers) {
      bro.generateTree(this.trim, this.compaction, this.byPC);
    }
  }
  static pxWidth = 128;
  static pxHeight = 16;

  // handleClick(i) {
  //   const history = this.state.history.slice(0, this.state.stepNumber + 1);
  //   const current = history[history.length - 1];
  //   const squares = current.squares.slice();
  //   squares[i] = this.state.xIsNext ? "X" : this.props.oSymbol;
  //   this.setState({
  //     history: history.concat([
  //       {
  //         squares: squares
  //       }
  //     ]),
  //     stepNumber: history.length,
  //     xIsNext: !this.state.xIsNext
  //   });
  // }

  static toPxWidth(num, delta) {
    return (num * Background.pxWidth + ((delta === undefined) ? 0 : delta)).toString() + "px";
  }

  static toPxHeight(num, delta) {
    return (num * Background.pxHeight + ((delta === undefined) ? 0 : delta)).toString() + "px";
  }

  render0() {
    var trees = this.curBrothers.map(brother => {return brother.stepladder(this.trim);});

    if (this.trim > 0) {
      for (let i = trees.length - 1; i >= 0; i--) {
       if (this.curBrothers[i].graduated && this.curBrothers[i].numLivingDecs === 0) {
          trees = trees.slice(0, i).concat(trees.slice(i + 1));
        }
      }
    }
    const widths = trees.map(li => {return li.width});
    trees = trees.map(li => {return li.stepladder});

    const gcas = [<li style={{display: "inline-block", verticalAlign: "top"}}> <div style={{border: "2px solid rgb(196,30,58)", width: "170px", height: "16px", textAlign: "center", verticalAlign: "middle", backgroundColor: "rgb(173,165,135)", whiteSpace: "pre-wrap", color: "rgb(196,30,58)", display: "inline-block"}}>{this.gcas[0].name}</div></li>];
    for (let i = 1; i < this.gcas.length; i++) {
      gcas.push(<li style={{display: "inline-block", verticalAlign: "top"}}> <div style={{width: "30px", height: "16px", textAlign: "center", verticalAlign: "middle", display: "inline-block"}}>{"→"}</div>
      <div style={{border: "2px solid rgb(196,30,58)", width: "170px", height: "16px", textAlign: "center", verticalAlign: "middle", backgroundColor: "rgb(173,165,135)", whiteSpace: "pre-wrap", color: "rgb(196,30,58)", display: "inline-block"}}>{this.gcas[i].name}</div></li>);
    }
    

    return (
      <div className="background">
        <ul>
        <li style={{display: "inline-block"}}>
          <ul >
          <div style={{border: "2px solid rgb(196,30,58)", width: "170px", height: "16px", textAlign: "center", verticalAlign: "middle", backgroundColor: "rgb(173,165,135)", whiteSpace: "pre-wrap", color: "rgb(196,30,58)", display: "inline-block"}}>{"GCAs"}</div>
            {drawSpouts2([1])}
            {this.pcList[1].stepladder().stepladder}
          </ul>
        </li >
        <ul style={{display: "inline-block"}}>
          <ul style={{listStyle: "none"}}>{gcas}</ul>
          <div>{drawSpouts2(widths)}</div>
          <ul style={{listStyle: "none"}}>{trees}</ul>
        </ul>
        </ul>
      </div>
    );
  }

  render() {
    var childTrees = [];
    
    for (let bro of this.curBrothers) {
      if (this.trim < 1 || !bro.graduated || bro.numLivingDecs > 0) {
        let child = bro.tree;
        if (this.byPC) {
          for (let i = 1; i < bro.pc; i++) {
            child = treeVertConcat(Brother.extention, child);
          }
        }
        childTrees.push(child);
      }
    }

    var tree = organizeTrees(childTrees, this.compaction)

    tree = treeVertConcat(new Tree([[new Branch(tree.spouts)]]), tree);
    tree = treeVertConcat(new Tree([this.gcas]), tree);
    tree = treeVertConcat(tree, new Tree([[new Branch()]]));

    for (let pc of this.pcList) {
      pc.renderSpecial = !this.byPC;
    }
    if (this.byPC) {
      tree = treeHorizConcat(this.pcList[0].tree, tree);
    } else {
      tree = treeVertConcat(tree, new Tree([this.pcList]));
    }

    return <div>{tree.render()}</div>;
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Background />);

function getBrothers() {
  var arr = pairsString.split(",");
  const gcas = [];
  let i = 1;
  for (; !arr[i].includes("Founding Class"); i++) {
    gcas.push(new Brother(arr[i].substring(1), null, -i, null, 0, true));
  }
  var roster = 0;
  var pc = 0;
  var out = [];
  for (; i < arr.length; i++) {
    let str = arr[i].substring(1);
    if (str.includes(" Class")) {
      pc++;
    } else if (str !== "") {
      let big = null;
      let transfer = arr[i + 1].localeCompare("transfer") === 0;
      if ((!transfer) && arr[i + 1].length !== 0) {
        for (let j = out.length - 1; j >= 0; j--) {
          if (arr[i + 1].localeCompare(out[j].name) === 0) {
            big = out[j];
            break;
          }
        }
      }

      let tmp = (transfer) ? roster + .5 : ++roster;
      
      let newBro = new Brother(str, big, tmp, arr[i + 2] !== "", pc);
      out.push(newBro);
      if (big !== null) {
        big.addLittle(newBro);
      }
      i += 2;
   }
  }
  for (let brother of out) {
    if (brother.numDecs === null) {
      brother.calculateDecs();
      brother.calculateLivingDecs();
    }
  }
  return {"rest": out, "gcas": gcas};
}

function getPCColor(pc) {
  if (pc === null) return null;
  var backgroundColor;
  var borderColor;
  if (pc === 1) {
    backgroundColor = "gold";
    borderColor = "black";
  } else if (pc === 0) {
    backgroundColor = "rgb(173,165,135)";
    borderColor = "rgb(196,30,58)";
  } else {
    let arr = [
      "255,192,210", // red
      "192,246,255", // light blue
      "246,192,255", // pink
      "192,255,210", // green
      "255,228,192", // orange
      "192,192,255", // dark blue
      // "228,255,192", // lime
    ]
    let arr2 = [
      "182,30,213", // purple
      "213,90,30", // red
      "61,213,30", // green
      "30,153,213", // blue
    ]
    const tmp = (pc - 2) % 23;
    backgroundColor = "rgb(" + arr[tmp % 6] + ")";
    borderColor = "rgb(" + arr2[Math.floor((tmp % 8) / 2)] + ")";
  }
  return {backgroundColor, borderColor};
}

function drawSpouts2(widths) {
  var els = [<li style={{display: "inline-block", verticalAlign: "top", height: "20px", width: "86px", backgroundColor: "white"}}></li>];
  if (widths.length > 0) {
    els.push(<li style={{display: "inline-block", verticalAlign: "top", height: "20px", width: "2px", backgroundColor: "black"}}></li>);
    if (widths.length > 1) {
      els.push(<li style={{display: "inline-block", verticalAlign: "top", height: "20px"}}>{
        <ul style={{listStyle: "none"}}>
          <li style={{verticalAlign: "top", height: "9px", width: ((116 + (widths[0] - 1) * 204).toString() + "px"), backgroundColor: "white"}}>{""}</li>
          <li style={{verticalAlign: "top", height: "2px", width: ((116 + (widths[0] - 1) * 204).toString() + "px"), backgroundColor: "black"}}>{""}</li>
        </ul>
      }</li>);
      for (let i = 1; i < widths.length - 1; i++) {
        els.push(<li style={{display: "inline-block", verticalAlign: "top", height: "20px"}}>{
          <ul style={{listStyle: "none"}}>
            <li style={{verticalAlign: "top", height: "9px", width: ((204 * widths[i]).toString() + "px"), backgroundColor: "white"}}>{""}</li>
            <li style={{verticalAlign: "top", height: "2px", width: ((204 * widths[i]).toString() + "px"), backgroundColor: "black"}}>{""}</li>
            <ul style={{listStyle: "none"}}>
              <li style={{display: "inline-block", verticalAlign: "top", height: "9px", width: "86px", backgroundColor: "white"}}>{""}</li>
              <li style={{display: "inline-block", verticalAlign: "top", height: "9px", width: "2px", backgroundColor: "black"}}>{""}</li>
            </ul>
          </ul>
        }</li>);
      }
      els.push(<li style={{display: "inline-block", verticalAlign: "top", height: "20px"}}>{
        <ul style={{listStyle: "none"}}>
          <li style={{verticalAlign: "top", height: "9px", width: "88px", backgroundColor: "white"}}>{""}</li>
          <li style={{verticalAlign: "top", height: "2px", width: "88px", backgroundColor: "black"}}>{""}</li>
          <ul style={{listStyle: "none"}}>
            <li style={{display: "inline-block", verticalAlign: "top", height: "9px", width: "86px", backgroundColor: "white"}}>{""}</li>
            <li style={{display: "inline-block", verticalAlign: "top", height: "9px", width: "2px", backgroundColor: "black"}}>{""}</li>
          </ul>
        </ul>
      }</li>);
    }
  }
  return <ul style={{listStyle: "none"}}>{els}</ul>;
}

function treeHorizConcat(left, right, compaction) {
  if (left.height === 0) {
    return right;
  } else if (right.height === 0) {
    return left;
  }

  const small = Math.min(left.height, right.height);
  const squish = compaction > 0 ? findSquish(left, right, small) : 0;

  const rows = [];

  function makeMid(inLeft, inRight, delta) {
    if (delta === undefined) delta = 0;
    let mid = [];
    if (inLeft instanceof Blank) {
      if (inRight instanceof Blank) {
        let tmp = inLeft.width + inRight.width + delta;
        if (tmp > 0) mid.push(new Blank(tmp));
      } else {
        let tmp = inLeft.width + delta;
        if (tmp > 0) mid.push(new Blank(tmp));
        mid.push(inRight);
      }
    } else if (inRight instanceof Blank) {
      mid.push(inLeft);
      let tmp = inRight.width + delta;
      if (tmp > 0) mid.push(new Blank(tmp));
    } else {
      mid.push(inLeft);
      mid.push(inRight);
    }
    return mid;
  }

  for (let i = 0; i < small; i++) {
    let outLeft = left.rows[i].slice(0, -1);
    let outRight = right.rows[i].slice(1);
    let mid = makeMid(left.rows[i][left.rows[i].length - 1], right.rows[i][0], -squish);

    rows.push(outLeft.concat(mid).concat(outRight));
  }
  if (left.height > right.height) {
    if (squish > right.width) {
      for (let i = 0; i < small; i++) {
        rows[i] = rows[i].slice(0, -1).concat(makeMid(rows[i][rows[i].length - 1], new Blank(squish - right.width)));
      }
      rows.push(...left.rows.slice(small));
    } else {
      for (let i = small; i < left.height; i++) {
        rows.push(left.rows[i].slice(0, -1).concat(makeMid(left.rows[i][left.rows[i].length - 1], new Blank(right.width - squish))));
      }
    }
  } else {
    for (let i = small; i < right.height; i++) {
      rows.push(makeMid(new Blank(left.width - squish), right.rows[i][0]).concat(right.rows[i].slice(1)));
    }
  }

  return new Tree(rows);
}

function findSquish(left, right, small) {
  if (small === undefined) small = Math.min(left.height, right.height);
  var squish = Infinity;
  for (let i = 0; i < small; i++) {
    let tmp = left.rows[i].length - 1;
    if (left.rows[i][tmp] instanceof Blank) {
      tmp = left.rows[i][tmp].width;
    } else {
      tmp = 0;
    }
    if (right.rows[i][0] instanceof Blank) {
      tmp += right.rows[i][0].width;
    }
  squish = Math.min(squish, tmp);
  }
  return squish;
}

function treeVertConcat(top, bottom) {
  if (top.height === 0) {
    return bottom;
  } else if (bottom.height === 0) {
    return top;
  } else if (top.width === bottom.width) {
    return new Tree(top.rows.concat(bottom.rows));
  }
  const rows = [];

  function extend(input, delta) {
    const out = [];
    for (let i = 0; i < input.length; i++) {
      out.push(input[i].slice(0, -1));
      let tmp = input[i][input[i].length - 1];
      if (tmp instanceof Blank) {
        out[i].push(new Blank(tmp.width + delta));
      } else {
        out[i].push(tmp, new Blank(delta));
      }
    }
    return out;
  }

  if (top.width < bottom.width) {
    rows.push(...extend(top.rows, bottom.width - top.width).concat(bottom.rows));
  } else {
    rows.push(...top.rows.concat(extend(bottom.rows, top.width - bottom.width)));
  }
  return new Tree(rows);
}

function organizeTrees(childTrees, compaction) {
  var tree = new Tree();
  if (compaction < 2) {
    for (let bro of childTrees) {
      tree = treeHorizConcat(tree, bro, compaction);
    }
  } else if (childTrees.length > 0) {
    while (childTrees.length > 1) {
      let curInd;
      if (tree.height === 0) {
      // if (true) {
        curInd = findDeepestAndSkinniest(childTrees);
      } else {
        let curMax = 0;
        curInd = 0;
        for (let i = 0; i < childTrees.length; i++) {
          let tmp = findSquish(tree, childTrees[i]);
          if (tmp > curMax || (tmp === curMax && compare(childTrees[i], childTrees[curInd]))) {
            curMax = tmp;
            curInd = i;
          }
        }
      }
      tree = treeHorizConcat(tree, childTrees[curInd], compaction);
      childTrees = childTrees.slice(0, curInd).concat(childTrees.slice(curInd + 1));
    }
    tree = treeHorizConcat(tree, childTrees[0], compaction);
  }

  function findDeepestAndSkinniest(childTrees) {
    let curInd = 0;
    for (let i = 1; i < childTrees.length; i++) {
      if (compare(childTrees[i], childTrees[curInd])) curInd = i;
    }
    return curInd;
  }

  function compare(left, right) {
    // returns left > right
    return (left.height > right.height + 2) || ((left.height + 2 >= right.height) && (left.width < right.width)) || (left.height === right.height + 2 && left.width === right.width + 1);
  }

  return tree;
}