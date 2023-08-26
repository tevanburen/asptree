import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { pairsString } from './txt.js';
import { Greek } from './greek.js';

// class PuzzlePiece extends React.Component {
//   constructor(props, brother) {
//     super(props);
//     this.brother = brother;
//   }

//   render() {
//     return (
//       <button className="square" >
//         {this.brother.name}
//       </button>
//     );
//   }
// }

class Brother {
  constructor(name, big, roster, graduated, pc) {
    this.name = name;
    this.big = big;
    this.littles = [];
    this.roster = roster;
    this.graduated = graduated;
    this.pc = pc;
  }

  addLittle(little) {
    this.littles.push(little)
  }

  stepladder() {
    let test = this.littles.map(brother => {return brother.stepladder();});
    return (
      <li>
        <div>{this.name + ", " + ((Number.isInteger(this.roster)) ? (Greek.getText(this.pc, false) + " #" + this.roster.toString()) : "Transfer Student")}</div>
        <ul style={{listStyle: "none"}}>{test}</ul>
      </li>
    );
  }
}

class Background extends React.Component {
  constructor(props, brothers) {
    super(props);
    this.allBrothers = getBrothers();
    this.curBrothers = [];
    for (const brother of this.allBrothers) {
      if (brother.big === null) {
        this.curBrothers.push(brother);
      }
    }
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

    let myText = "";
    for (const brother of this.curBrothers) {
      let tmp = brother.big;
      if (tmp !== null) {
        tmp = tmp.name;
      }
      myText += brother.name + ": " + brother.roster.toString() + " (" + tmp + ")";
    }

    // let test = this.curBrothers.map(brother => brother.stepladder);
    const test = this.curBrothers.map(brother => {return brother.stepladder();});

    return (
      <div className="background">
          {/* <div>{myText}</div> */}
          <ul style={{listStyle: "none"}}>{test}</ul>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Background />);

function getBrothers() {
  var arr = pairsString.split(",");
  var out = [];
  var roster = 0;
  var pc = 0;
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].substring(1);
    if (str.includes(" Class")) {
      pc++;
    } else if (str !== "") {
      let big = null;
      let transfer = arr[i + 1].localeCompare("transfer") === 0;
      if ((!transfer) && arr[i + 1].length !== 0) {
        big = "tried";
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
  return out;
}