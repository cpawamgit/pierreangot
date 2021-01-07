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
          renderMode="svg"
          rotate={props.rotate}
        />
      </Document>
      <div className="navigationButtons">
        <p>
          Page {pageNumber || (numPages ? 1 : '--')} sur {numPages || '--'}
        </p>
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          Précédent
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          Suivant
        </button>
        <button onClick={() => { props.changeScale(0.2) }}>
          Agrandir
        </button>
        <button onClick={() => { props.changeScale(-0.2) }}>
          Réduire
        </button>
        <button onClick={() => { props.changeRotation() }}>Rotation</button>
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
      displayHome: true,
      displayBrowse: false,
      displayPrice: false,
      loading: false,
      rotation: 0,
    }
    this.baseButtonHandleClick = this.baseButtonHandleClick.bind(this);
    this.displayListHandleClick = this.displayListHandleClick.bind(this);
    this.reinitState = this.reinitState.bind(this);
    this.changeScale = this.changeScale.bind(this);
    this.displayBrowse = this.displayBrowse.bind(this);
    this.displayHome = this.displayHome.bind(this);
    this.displayPrice = this.displayPrice.bind(this);
    this.rotate = this.rotate.bind(this);
    this.endLoading = this.endLoading.bind(this);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
    });
  }

  changeScale(value) {
    this.setState({
      scale: this.state.scale + value
    });
  }

  rotate() {
    if (this.state.rotation === 270)
      this.setState({
        rotation: 0
      });
    else {
      this.setState({
        rotation: this.state.rotation + 90
      });
    }
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
        fileName: `${this.state.fullPath}${name}`,
        loading: true
      });
      setTimeout(this.endLoading, 2000)
    }
    this.scrollToTop();
  }

  endLoading() {
    this.setState({
      loading: false
    })
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

  displayHome() {
    this.setState({
      displayHome: true,
      displayBrowse: false,
      dislayWiki: false,
      displayPrice: false
    });
  }

  displayBrowse() {
    this.setState({
      displayHome: false,
      displayBrowse: true,
      dislayWiki: false,
      displayPrice: false
    });
  }

  displayPrice() {
    this.setState({
      displayHome: false,
      displayBrowse: false,
      dislayWiki: false,
      displayPrice: true
    });
  }

  render() {
    const pathStyle = this.state.loading ? { color: "red" } : null;
    const baseButton = <button onClick={this.baseButtonHandleClick}>Parcourir</button>
    const reinitButton = <button onClick={this.reinitState}>Réinitialiser</button>
    const displayList = this.state.actualObject.map((item, index) => {
      return (
        <button onClick={() => { this.displayListHandleClick(item.name, item.type, index) }}
          className="displayList"
          index={index} key={item.name}
          typeofbutton={item.type}
        >
          {item.name}
        </button>
      );
    });
    //todelete after test
    displayList.unshift(<button style={pathStyle}>{this.state.fullPath}{this.state.loading && "...Chargement du document"}</button>)
    const displayDiv = <div className="displayDiv">{reinitButton}{displayList}</div>
    return (
      <div>
        {<div className="header">
          <h1>Pierre Angot, Compositeur Français</h1>
          <div className="menu">
            <p onClick={this.displayHome}>Acceuil</p>
            <p onClick={this.displayBrowse}>Parcourir les partitions</p>
            <a href="https://fr.wikipedia.org/wiki/Pierre_Angot" rel="noreferrer" target="_blank" id="wiki">Wikipedia</a>
            <p onClick={this.displayPrice}>Tarifs et droits d'utilisation</p>
          </div>
        </div>}
        {this.state.displayBrowse && <div className="searchAndDisplay">
          <div className="searchDiv">
            {this.state.baseButton ? baseButton : null}
            {!this.state.baseButton && displayDiv}
          </div>
          <PdfDisplayer
            className="appWrapper"
            name={this.state.fileName}
            scale={this.state.scale}
            changeScale={this.changeScale}
            rotate={this.state.rotation}
            changeRotation={this.rotate}
          />
        </div>}
        {this.state.displayHome &&
          <div className="homeDiv">
          </div>
        }
        {this.state.displayPrice &&
          <div className="priceDiv">
          </div>
        }

      </div>
    );
  }

}

//console.log(files);

export default App;
