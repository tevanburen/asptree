import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { pairsString } from './txt.js';
import { Greek } from './greek.js';

class Brother {
  constructor(name, big, roster, graduated, pc) {
    this.name = name;
    this.big = big;
    this.littles = [];
    this.roster = roster;
    this.graduated = graduated;
    this.pc = pc;
    this.numDecs = null;
    this.numLivingDecs = null;
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
    this.trim = 2;
    let grads = new Array(this.maxPC).fill(true);
    for (let brother of this.allBrothers) {
      grads[brother.pc] &= brother.graduated;
    }
    this.pcList = new Array(this.maxPC);
    this.pcList[1] = new Brother(Greek.getText(1, true), null, null, grads[1], 1);
    for (let i = 2; i <= this.maxPC; i++) {
      this.pcList[i] = new Brother(Greek.getText(i, true), this.pcList[i - 1], null, grads[i], i);
      this.pcList[i - 1].addLittle(this.pcList[i]);
    }
    this.displayType = 0;
  }

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

  render() {
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
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Background />);

function getBrothers() {
  var arr = pairsString.split(",");
  const gcas = [];
  let i = 1;
  for (; !arr[i].includes("Founding Class"); i++) {
    gcas.push(new Brother(arr[i].substring(1), null, -i, true, 0));
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
  if (pc === 1) return "gold";
  let arr = ["192,192,255",
    "255,192,210",
    "228,255,192",
    "246,192,255",
    "192,246,255",
    "255,228,192",
    "192,255,210"]
  return "rgb(" + arr[(pc - 1) % 7] + ")";
}

function drawSpouts(widths) {
  // const canvas = <canvas id="tutorial" width="150" height="150"></canvas>;
  // const ctx = canvas.getContext("2d");
  // const canvas = <canvas style={{width: totalWidth * 180, height: 10}}></canvas>;
  // const ctx = canvas.getContext();
  var els = [];
  if (widths.length > 1) {
    els.push(<li style={{display: "inline-block", verticalAlign: "top", minWidth: ((widths[0] * 204).toString() + "px"), whiteSpace: "pre-wrap"}}>{"   |\nг---^" + "-".repeat(70) + "-".repeat(Math.floor(78.1 * (widths[0] - 1)))}</li>);
    for (let i = 1; i < widths.length - 1; i++) {
      els.push(<li style={{display: "inline-block", verticalAlign: "top", minWidth: ((widths[i] * 204).toString() + "px"), whiteSpace: "pre-wrap"}}>{"\nv" + "-".repeat(75) + "-".repeat(Math.floor(78.1 * (widths[i] - 1)))}</li>);
    }
    els.push(<li style={{display: "inline-block", verticalAlign: "top", whiteSpace: "pre-wrap"}}>{"\n7"}</li>);
  } else if (widths.length === 1) {
    els.push(<li style={{display: "inline-block", verticalAlign: "top", whiteSpace: "pre-wrap"}}>{"|\n|"}</li>);
  }
  return <ul style={{listStyle: "none"}}>{els}</ul>;
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