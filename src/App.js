import './App.css';
import files from "./site.json";
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


function PdfDisplayer(props) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const toDisplay = `${process.env.PUBLIC_URL}${props.name}`;
  return (
    <div>
      <Document
        file={toDisplay}
        onLoadSuccess={onDocumentLoadSuccess}
        style={{ margin: 0, padding: 0 }}
      >
        <Page pageNumber={pageNumber}
          height={800}
          style={{ margin: 0, padding: 0 }}
          scale={props.scale}
        />
      </Document>
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
        </p>
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Next
        </button>
        <button onClick={() => { props.changeScale(0.2) }}>
          Agrandir
        </button>
        <button onClick={() => { props.changeScale(-0.2) }}>
          Réduire
        </button>
        <button>
          <a download={toDisplay} href={toDisplay}>Télécharger</a>
        </button>
      </div>
    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseButton: true,
      fullPath: '/sitePdfs/', //building after clicking each new button, i have to implement a return button two
      fileName: '',
      actualObject: [],
      scale: 1,
      displayHome: false,
      displayBrowse: true,
      displayPrice: false
    }
    this.baseButtonHandleClick = this.baseButtonHandleClick.bind(this);
    this.displayListHandleClick = this.displayListHandleClick.bind(this);
    this.reinitState = this.reinitState.bind(this);
    this.changeScale = this.changeScale.bind(this);
    this.displayBrowse = this.displayBrowse.bind(this);
    this.displayHome = this.displayHome.bind(this);
    this.displayPrice = this.displayPrice.bind(this);
  }

  changeScale(value) {
    this.setState({
      scale: this.state.scale + value
    });
  }

  baseButtonHandleClick() {
    this.setState({
      baseButton: false,
      actualObject: [...files[0].contents]
    });
  }

  displayListHandleClick(name, typeofbutton, index) {
    if (typeofbutton === "directory") {
      this.setState({
        actualObject: this.state.actualObject[index].contents,
        fullPath: this.state.fullPath + `${name}/`
      });
    }
    else {
      this.setState({
        fileName: `${this.state.fullPath}${name}`
      });
    }
  }

  reinitState() {
    this.setState({
      baseButton: true,
      fullPath: '/sitePdfs/',
      fileName: '',
      actualObject: [],
      scale: 1
    });
  }

  displayHome(){
    this.setState({
      displayHome: true,
      displayBrowse: false,
      dislayWiki: false,
      displayPrice: false
    });
  }

  displayBrowse(){
    this.setState({
      displayHome: false,
      displayBrowse: true,
      dislayWiki: false,
      displayPrice: false
    });
  }

  displayPrice(){
    this.setState({
      displayHome: false,
      displayBrowse: false,
      dislayWiki: false,
      displayPrice: true
    });
  }

  render() {
    const baseButton = <button onClick={this.baseButtonHandleClick}>Parcourir</button>
    const reinitButton = <button onClick={this.reinitState}>Réinitialiser</button>
    const displayList = this.state.actualObject.map((item, index) => {
      return (
        <button onClick={() => { this.displayListHandleClick(item.name, item.type, index) }} className="displayList" index={index} key={item.name} typeofbutton={item.type}>{item.name}</button>
      );
    });
    //todelete after test
    displayList.unshift(<button>{this.state.fullPath}</button>)
    const displayDiv = <div className="displayDiv">{displayList}</div>
    return (
      <div>
        {<div className="header">
          <h1>Pierre Angot, Compositeur Français</h1>
          <div className="menu">
            <p onClick={this.displayHome}>Acceuil</p>
            <p onClick={this.displayBrowse}>Parcourir les partitions</p>
            <p>Wikipedia</p>
            <p onClick={this.displayPrice}>Tarifs et droits d'utilisation</p>
          </div>
        </div>}
        {this.state.displayBrowse && <div className="searchAndDisplay">
          <div className="searchDiv">
            {this.state.baseButton ? baseButton : reinitButton}
            {!this.state.baseButton && displayDiv}
          </div>
          <PdfDisplayer
            className="appWrapper"
            name={this.state.fileName}
            scale={this.state.scale}
            changeScale={this.changeScale}
          />
        </div>}
      </div>
    );
  }

}

//console.log(files);

export default App;
