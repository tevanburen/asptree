import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { pairsString } from './txt.js';
import { Greek } from './greek.js';
import gradcap_tmp from './gradcap.png';
import menu_tmp from './menu.png';
import crest_tmp from './logo512.png';
const gradcap = {img: gradcap_tmp, width: .3, ratio: 6785 / 6321};
const menu = {img: menu_tmp, width: .3};
const crest = {img: crest_tmp, width: .8};
const stone = "rgb(173,165,135)";
const cardinal = "rgb(196,30,58)";

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

  getWidth() {
    return Brother.width;
  }

  static extention;
  static extentionFlip;

  generateTree(trim, compaction, byPC, bottomPC) {
    var childTrees = [];
    var minChildPC = Infinity;
    if (byPC) {
      for (let bro of this.littles) {
        if ((trim < 2 || !bro.graduated || bro.numLivingDecs > 0) && bro.pc <= bottomPC) {
          minChildPC = Math.min(minChildPC, bro.pc);
        }
      }
    }
    for (let bro of this.littles) {
      if ((trim < 2 || !bro.graduated || bro.numLivingDecs > 0) && bro.pc <= bottomPC) {
        let child = bro.generateTree(trim, compaction, byPC, bottomPC);
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
      if (this.pc !== null) return <ul><li style={{display: "inline-block"}}><div style={{width: Background.toPxWidth(Brother.width, -4-Background.pxHeight), marginLeft: margin, marginRight: margin, height: Background.toPxHeight(Brother.height, -4), backgroundColor: pcColor.backgroundColor, display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid " + pcColor.borderColor, whiteSpace: "normal", textAlign: "center"}}>
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
        <div style={{width: Background.toPxWidth(Brother.width, -4-Background.pxHeight), height: Background.toPxHeight(Brother.height, -4), backgroundColor: pcColor.backgroundColor, display: "flex", justifyContent: "center", alignItems: "center", border: "2px solid " + pcColor.borderColor, whiteSpace: "normal", textAlign: "center"}}>
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
    let grads = new Array(this.maxPC).fill(true);
    for (let brother of this.allBrothers) {
      grads[brother.pc] &= brother.graduated;
      this.maxPC = Math.max(this.maxPC, brother.pc);
    }

    this.pcList = new Array(this.maxPC);
    this.pcList[0] = new Brother(Greek.getText(0, true), null, null, null, 0, false);
    for (let i = 1; i <= this.maxPC; i++) {
      this.pcList[i] = new Brother(Greek.getText(i, true), this.pcList[i - 1], null, grads[i], i, false);
      this.pcList[i - 1].addLittle(this.pcList[i]);
    }

    printCSV(this.allBrothers);

    Brother.extention = new Tree([[new Brother(null, null, null, null, null)], [new Branch([0])]]);
    Brother.extentionFlip = new Tree([[new Branch([0])], [new Brother(null, null, null, null, null)]]);

    this.trim = 0;
    this.compaction = 2;
    this.byPC = true;
    this.menuState = false;
    this.bottomPC = this.maxPC;
    this.topPC = 1;
  }
  static pxWidth = 128;
  static pxHeight = 16;

  static toPxWidth(num, delta) {
    return (num * Background.pxWidth + ((delta === undefined) ? 0 : delta)).toString() + "px";
  }

  static toPxHeight(num, delta) {
    return (num * Background.pxHeight + ((delta === undefined) ? 0 : delta)).toString() + "px";
  }

  menuBar() {
    let wh = Background.toPxHeight(Brother.height, -4);

    function getButton(isSelected, listener, text, back, info) {
      const w6 = Background.toPxHeight(Brother.height / 6);
      const w3ish = Background.toPxHeight(Brother.height / 3, -4);
      const height = Background.toPxHeight(Brother.height / 2);
      
      return <ul onMouseDown={() => {listener(back, info)}} style={{width: Background.toPxWidth(Brother.width, -2 - Background.pxHeight / 2), height: height, display: "flex", justifyContent: "center"}}>
        <li style={{display: "inline-block", height: height, width: w6}}></li>
        <li style={{display: "inline-block", height: height, width: Background.toPxHeight(Brother.height / 3)}}>
          <ul style={{display: "flex", height: height, width: Background.toPxHeight(Brother.height / 3), justifyContent: "center", alignItems: "center", whiteSpace: "normal"}}>
            <div style={{height: w3ish, width: w3ish, border: "2px solid black", background: (isSelected ? cardinal : stone)}}></div>
          </ul>
        </li>
        <li style={{display: "inline-block", height: height, width: w6}}></li>
        <li style={{display: "inline-block", height: height, width: Background.toPxHeight(Brother.height * 1.5)}}><div style={{width: Background.toPxHeight(Brother.height * 1.5), height: height, display: "flex", justifyContent: "left", alignItems: "center", whiteSpace: "nowrap", textAlign: "center"}}>{text}</div></li>
        <li style={{display: "inline-block", height: height, width: w6}}></li>
      </ul>;
    }
    function getDropdown(listener, back, curPC) {
      const height = Background.toPxHeight(Brother.height / 2);
      const handle = (e) => {listener(back, parseInt(e.target.value));};
      return <div style={{width: Background.toPxWidth(Brother.width, -2 - Background.pxHeight), height: height, display: "flex", justifyContent: "center"}}>
        <select onChange={handle} value={curPC} style={{width: Background.toPxHeight(Brother.height * 2), height: height, display: "flex", justifyContent: "left", alignItems: "center", whiteSpace: "nowrap", textAlign: "center", border: "2px solid " + cardinal, background: stone, font: "12px"}}>
          {back.pcList.slice(1).map((pc) => {return <option value={pc.pc}>{Greek.getText(pc.pc, false)}</option>})}
        </select>
      </div>;
    }
    function byPCHandler(back, info) {
      if (back.byPC !== info) {
        back.byPC = info;
        window.scrollTo(0, 0);
        back.forceUpdate();
      }
    }
    function trimHandler(back, info) {
      if (back.trim !== info) {
        back.trim = info;
        window.scrollTo(0, 0);
        back.forceUpdate();
      }
    }
    function compactionHandler(back, info) {
      if (back.compaction !== info) {
        back.compaction = info;
        window.scrollTo(0, 0);
        back.forceUpdate();
      }
    }
    function topPCHandler(back, info) {
      if (back.topPC !== info) {
        back.topPC = info;
        back.bottomPC = Math.max(back.topPC, back.bottomPC);
        window.scrollTo(0, 0);
        back.forceUpdate();
      }
    }
    function bottomPCHandler(back, info) {
      if (back.bottomPC !== info) {
        back.bottomPC = info;
        back.topPC = Math.min(back.topPC, back.bottomPC);
        back.forceUpdate();
      }
    }

    const spacing = <li style={{width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(Brother.height / 5)}}></li>



    return <ul style={{position: "fixed", right: 20, top: 20, zIndex: 1}}>
        {this.menuState ? <li style={{display: "inline-block", position: "relative", left: Background.toPxHeight(Brother.height)}}>
            <ul style={{width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight((7 * (Brother.height + 1)) - 1, -4), backgroundColor: stone, border: "2px solid " + cardinal}}>
              <li style={{width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(Brother.height * 2 + 1, -2)}}></li>
              <li style={{display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "normal", width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(1)}}>Pledge classes shown:</li>
              <li style={{width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(Brother.height / 2)}}>
                <ul>
                  <li style={{display: "inline-block"}}>{getDropdown(topPCHandler, this, this.topPC)}</li>
                  <li style={{display: "inline-block"}}><div style={{height: Background.toPxHeight(Brother.height / 2), display: "flex", alignItems: "center", justifyContent: "center"}}>to</div></li>
                  <li style={{display: "inline-block"}}>{getDropdown(bottomPCHandler, this, this.bottomPC)}</li>
                </ul>
              </li>
              {spacing}
              <li style={{display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "normal", width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(1)}}>Row display options:</li>
              <li style={{width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(Brother.height / 2)}}>
                <ul>
                  <li style={{display: "inline-block"}}>{getButton(this.byPC, byPCHandler, "By pledge class", this, true)}</li>
                  <li style={{display: "inline-block"}}>{getButton(!this.byPC, byPCHandler, "By generation", this, false)}</li>
                </ul>
              </li>
              {spacing}
              <li style={{display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "normal", width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(1)}}>Tree display options:</li>
              <li style={{width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(Brother.height * 1.5)}}>
                <ul>
                  <li>{getButton(this.trim === 0, trimHandler, "Show all brothers", this, 0)}</li>
                  <li>{getButton(this.trim === 1, trimHandler, "Show only active trees", this, 1)}</li>
                  <li>{getButton(this.trim === 2, trimHandler, "Show only active branches", this, 2)}</li>
                </ul>
              </li>
              {spacing}
              <li style={{display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "normal", width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(1)}}>Other display options:</li>
              <li style={{width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(Brother.height * 1.5)}}>
                <ul>
                  <li>{getButton(this.compaction === 0, compactionHandler, "Keep trees separated", this, 0)}</li>
                  <li>{getButton(this.compaction === 1, compactionHandler, "Trim empty space", this, 1)}</li>
                  <li>{getButton(this.compaction === 2, compactionHandler, "Optimize space (no roster order)", this, 2)}</li>
                </ul>
              </li>
              {spacing}
              <li style={{display: "flex", alignItems: "center", justifyContent: "right", whiteSpace: "pre", width: Background.toPxWidth(Brother.width * 2, -4 - Background.pxHeight), height: Background.toPxHeight(1, -2), textAlign: "right", fontSize: "8px"}}><p>Created by TVB in 2023 <br></br>Email <a style={{color: cardinal, display: "inline-block"}} href = "mailto: tevanburen@gmail.com?subject = ASP ZH Family Tree&body = wow thomas you did such a good job building this that's so cool i wish i could do something as impressive. anyway, ">tevanburen@gmail.com</a> if you find a mistake </p></li>
              {spacing}
            </ul>
        </li> : ""}
        <li style={{display: "inline-block", position: "relative"}}>
            <div onClick={() => {this.menuState = !this.menuState; this.forceUpdate()}} style={{width: wh, height: wh, backgroundColor: stone, border: "2px solid " + cardinal, whiteSpace: "normal", textAlign: "center"}}></div>
        </li>
        <li style={{width: 0, height: 0, display: "inline-block", position: "relative", right: "43px", top: "5px", pointerEvents: "none"}}>
          <img src={menu.img} alt="{menu icon}" width={Background.toPxWidth(menu.width)} height={Background.toPxWidth(menu.width)} />
        </li>
        {this.menuState ? <li style={{width: 0, height: 0, display: "inline-block", position: "relative", right: "171px", top: "8px"}}>
                <img src={crest.img} alt="{crest}" width={Background.toPxWidth(crest.width)} height={Background.toPxWidth(crest.width)} />
        </li> : ""}
    </ul>;
  }

  render() {
    this.curBrothers.length = 0;
    for (let brother of this.allBrothers) {
      if (brother.pc === this.topPC || (brother.big === null && this.topPC === 1 && brother.pc <= this.bottomPC)) {
        this.curBrothers.push(brother);
      }
    }
    var childTrees = [];
    
    for (let bro of this.curBrothers) {
      if (this.trim < 1 || !bro.graduated || bro.numLivingDecs > 0) {
        let child = bro.generateTree(this.trim, this.compaction, this.byPC, this.bottomPC);
        if (this.byPC) {
          for (let i = this.topPC; i < bro.pc; i++) {
            child = treeVertConcat(Brother.extention, child);
          }
        }
        childTrees.push(child);
      }
    }

    var tree;
    if (childTrees.length === 0) {
      tree = new Tree([[new Brother("No brothers fit these filters", null, null, null, this.topPC, false)]]);
    } else {
      tree = organizeTrees(childTrees, this.compaction)
    }

    tree = treeVertConcat(new Tree([[new Branch(tree.spouts)]]), tree);
    tree = treeVertConcat(new Tree([this.gcas]), tree);

    for (let pc of this.pcList) {
      pc.renderSpecial = !this.byPC;
    }
    if (this.byPC) {
      tree = treeHorizConcat(treeVertConcat(new Tree([[this.pcList[0]], [new Branch([0])]]), this.pcList[this.topPC].generateTree(0, 0, true, this.bottomPC)), tree);
    } else {
      tree = treeVertConcat(new Tree([[new Branch()]]), tree);
      tree = treeVertConcat(new Tree([this.pcList.slice(0, 1).concat(this.pcList.slice(this.topPC, this.bottomPC + 1))]), tree);
    }

    return <ul style={{}}>
      <li>{this.menuBar()}</li>
      <li style={{display: "inline-block"}} onMouseDown={() => {
        if (this.menuState) {
          this.menuState = false;
          this.forceUpdate();
        }
      }}>{tree.render()}</li>
      </ul>;
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Background />);
// root.render(<div>Hello</div>);

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
  var transCount = 0;
  for (; i < arr.length; i++) {
    let str = arr[i].substring(1);
    if (str.includes(" Class")) {
      transCount = 0;
      pc++;
    } else if (str.includes("Transfers")) {
      transCount = 1;
    } else if (str !== "") {
      let big = null;

      let tmp = (transCount > 0) ? roster + (5 * (1 - (10 ** -(transCount++))) / 9) : ++roster;

      if (arr[i + 1].length !== 0) {
        for (let j = out.length - 1; j >= 0; j--) {
          if (arr[i + 1].localeCompare(out[j].name) === 0) {
            big = out[j];
            break;
          }
        }
      }
      
      let newBro = new Brother(str, big, tmp, arr[i + 2] !== "", (transCount > 0) ? pc + 1 : pc);
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
    backgroundColor = stone;
    borderColor = cardinal;
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

function printCSV(brothers) {
  console.log("CSV:");
  var str = "class,roster,name,graduated\n";
  for (let brother of brothers) {
    str += Greek.getText(brother.pc, true) + "," + brother.roster + "," + brother.name + "," + brother.graduated + "\n";
  }
  console.log(str);
}