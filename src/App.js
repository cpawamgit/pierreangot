import './App.css';
import files from "./site.json";
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
//import { act } from 'react-dom/test-utils';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;



const isSmatphone = detectMob();

function detectMob() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}

function PopUp(props) {
  return (
    <div className={isSmatphone ? "popUpDivPhone" : "popUpDiv"}>
      <p>Certains documents sont très lourds et peuvent mettre du temps à charger.</p>      
      <p>Veuillez noter que les documents contiennent des pages blanches pour le tirage</p>
      <p>Cliquer sur ok pour faire disparaitre ce message</p>
      <button onClick={props.hidePopUp}>
        OK !
        </button>
    </div>
  );
}

function PdfDisplayer(props) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function clickDownloadPhone() {
    document.getElementById("download-link").click();
  }

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
  const phoneDownload = isSmatphone ? 
  <a id="download-link" onClick={clickDownloadPhone} download={toDisplay} href={toDisplay}><p id="phone-download-text">Télécharger</p></a> :
  <a id="download-link" download={toDisplay} href={toDisplay}>Télécharger</a>
  const downloadButton = isSmatphone ? <button onClick={clickDownloadPhone} id={isSmatphone ? "download-button-phone" : "download-button"}>
  {phoneDownload}
</button>
  :  
  <button id={isSmatphone ? "download-button-phone" : "download-button"}>
  {phoneDownload}
</button>
const pageNumberDisplay = <p id="page-number">
Page {pageNumber || (numPages ? 1 : '--')} sur {numPages || '--'}
</p>
  const buttons = <div className={isSmatphone ? "navigationButtonsPhone" : "navigationButtons"}>
  {!isSmatphone && pageNumberDisplay}
  <button
    id={isSmatphone ? "previous-button-phone" : "previous-button"}
    type="button"
    disabled={pageNumber <= 1}
    onClick={previousPage}
  >
    {isSmatphone ? null : "Précédent"}
  </button>
  <button
    id={isSmatphone ? "next-button-phone" : "next-button"}
    type="button"
    disabled={pageNumber >= numPages}
    onClick={nextPage}
  >
    {isSmatphone ? null : "Suivant"}          
  </button>
  {!isSmatphone &&
  <button onClick={() => { props.changeScale(0.2) }}>
    {isSmatphone ? null : "Agrandir"}     
  </button>
  }
  {!isSmatphone &&
  <button onClick={() => { props.changeScale(-0.2) }}>
    {isSmatphone ? null : "Rétrécir"}    
  </button>
  }
  <button id={isSmatphone ? "rotation-button-phone" : "rotation-button"} onClick={() => { props.changeRotation() }}>
  {isSmatphone ? null : "Rotation"}  
  </button>
  {downloadButton}
</div>
const appWrapperStyle = props.rotate === 90 ? {left: 0} : props.rotate === 270 ? {left: 0} : null;
  return (
    <div style={appWrapperStyle} id="appWrapper" className={isSmatphone ? "appWrapperPhone" : "appWrapper"}>
      <Document
        file={toDisplay}
        onLoadSuccess={onDocumentLoadSuccess}
        style={{ margin: 0, padding: 0 }}
        error=""
      >
        <Page pageNumber={pageNumber}
          height={800}
          style={{ margin: 0, padding: 0 }}
          scale={props.scale}
          renderMode="svg"
          rotate={props.rotate}
          error=""
        />
      </Document>
      {isSmatphone ? props.displaySearchMenu ? null : pageNumberDisplay : null}
      {isSmatphone ? props.displaySearchMenu ? null : buttons : buttons}
      
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
      actualObject: [...files[0].contents],
      scale: isSmatphone ? 0.63 : 1,
      displayHome: true,
      displayBrowse: false,
      displayPrice: false,
      loading: false,
      rotation: 0,
      popUp: false,
      blockPopUp: false,
      displaySearchMenu: true,
    }
    this.displayListHandleClick = this.displayListHandleClick.bind(this);
    this.reinitState = this.reinitState.bind(this);
    this.changeScale = this.changeScale.bind(this);
    this.displayBrowse = this.displayBrowse.bind(this);
    this.displayHome = this.displayHome.bind(this);
    this.displayPrice = this.displayPrice.bind(this);
    this.rotate = this.rotate.bind(this);
    this.endLoading = this.endLoading.bind(this);
    this.returnFunc = this.returnFunc.bind(this);
    this.hidePopUp = this.hidePopUp.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu(){
    this.setState({
      displaySearchMenu: !this.state.displaySearchMenu
    })
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

  returnFunc() {
    let actualPath = this.state.fullPath.split('/');
    actualPath = actualPath.filter(item => item !== "");
    let newPathDisplay = "/";
    let obj1 = [...files];
    if (actualPath.length > 1) {
      actualPath.pop();
      actualPath[0] = "sitePdfs/";
      newPathDisplay += `${actualPath.join('/')}/`;
      for (let i = 0; i < actualPath.length; i++) {
        obj1 = obj1.filter(item => item.name === actualPath[i]);
        obj1 = obj1[0];
        obj1 = obj1.contents;
      }
      this.setState({
        actualObject: obj1,
        fullPath: newPathDisplay
      });
    }

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
      setTimeout(this.endLoading, 2200)
    }
    this.scrollToTop();
  }

  hidePopUp() {
    this.setState({
      blockPopUp: true
    });
  }

  endLoading() {
    if (isSmatphone){
      this.toggleMenu();
    }
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
      displayPrice: false,
      popUp: true
    });
    this.scrollToTop();
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
    const headerDiv = <div className="header">
    <h1>Pierre Angot, Compositeur Français</h1>
    <div className="menu">
      <p onClick={this.displayHome}>Acceuil</p>
      <p onClick={this.displayBrowse}>Parcourir les partitions</p>
      <a href="https://fr.wikipedia.org/wiki/Pierre_Angot" rel="noreferrer" target="_blank" id="wiki">Wikipedia</a>
      <p onClick={this.displayPrice}>Tarifs et droits d'utilisation</p>
    </div>
  </div>
    const pathStyle = this.state.loading ? { color: "red", height: "max-content" } : null;
    const returnButton = <button style={{cursor: 'pointer'}} onClick={this.returnFunc}>Retour</button>
    const displayList = this.state.actualObject.map((item, index) => {
      return (
        <button onClick={() => { this.displayListHandleClick(item.name, item.type, index) }}
          className={isSmatphone ? "displayListPhone" : "displayList"}
          index={index} key={item.name}
          typeofbutton={item.type}
          style={{cursor: 'pointer'}}
        >
          {item.name}
        </button>
      );
    });
    displayList.unshift(returnButton);
    const pathToDisplay = "Chemin : " + this.state.fullPath.slice(10);
    displayList.unshift(<button style={pathStyle}>{pathToDisplay}{this.state.loading && "...Chargement du document"}</button>);    
    const displayDiv = <div className={isSmatphone ? "displayDivPhone" : "displayDiv"}>{displayList}</div>
    const fileBrowserHeader = <div className="fileBrowserHeader">
      <button onClick={this.toggleMenu}>Menu</button>
      <button onClick={this.displayHome}>Acceuil</button>
    </div>
    const searchDiv = <div className={isSmatphone ? "searchDivPhone" : "searchDiv"}>
    {this.state.displayBrowse && displayDiv}
  </div>
    return (
      <div className="master-div">
        {isSmatphone ? this.state.displayBrowse ? fileBrowserHeader : headerDiv : headerDiv}
        {this.state.displayBrowse && 
        <div className={isSmatphone ? "searchAndDisplayPhone" : "searchAndDisplay"}>
          {this.state.popUp && !this.state.blockPopUp && <PopUp hidePopUp={this.hidePopUp} />}
          {this.state.displaySearchMenu && searchDiv}
          <PdfDisplayer
            id="wrapp"            
            name={this.state.fileName}
            scale={this.state.scale}
            changeScale={this.changeScale}
            rotate={this.state.rotation}
            changeRotation={this.rotate}
            displaySearchMenu={this.state.displaySearchMenu}
          />
        </div>}
        {this.state.displayHome &&
          <div className="homeDiv-master">
            <div className="homeDiv"> {/*backgroundDiv*/}

            </div>
            <div className="homeTextWrapper">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Pierre_%26_Micka%C3%ABl_02.JPG"
                alt="Pierre Angot"
                height="222px"
                width="198"
              >
              </img>
              <h2>"Ajouter et ne rien détruire"</h2>
              <p>Pierre ANGOT est un compositeur français né en Normandie , le premier mars 1958.
              Dans sa jeunesse il fût autant musicien de jazz que d'orchestre, il sera aussi professeur de basson.
</p>
              <p>
                Elève en composition d'Alain Abbot il s'en détournera rapidement se mettant en rupture dans les années 90 jusqu’à détruire son travail accompli jusque là : il le jugera trop  conforme à la doxa musicale de la deuxième partie du 20ème siècle jusqu'à aujourd'hui.
</p>
              <p>
                Pour lui, sa production débutera donc réellement en 2002 avec la "Sonatine Picturale", créée cette même année par le pianiste Mickaël Bardin. Il  reniera donc toutes ses pièces antérieures  sauf ce qu'il comptera pour ses 4 premiers Opus qui sont plus de l'ordre de la gageure musicale.
                Il cherchera à retrouver le contact avec le public perdu dans les courants de l'école de Darmstadt, notamment sériel ou musique concrète.
                Il ne prêtera pas  plus d'intérêt aux dernières mouvances telles  que le néo tonalisme.
                On peut donc difficilement qualifier la musique de Pierre ANGOT,  si ce n'est qu'elle est le fruit incessant de longues recherches sur le plan esthétique, recherchant à redonner une vérité émotionnelle à la musique dite savante.
</p>
              <p>
                Son engouement ira à des compositeurs tels qu'Henri Tomasi  ou  Henri Dutilleux pour renouveler le langage musical.
                La recherche obsessionnelle de nouvelles couleurs musicales, sans jamais se départir de l'héritage du passé, peut qualifier la démarche de Pierre ANGOT :  "Ajouter et ne rien détruire" pourrait être sa devise .
</p>

            </div>
            
          </div>
        }
        {this.state.displayPrice &&
          <div className="priceMaster">
            <div className="priceDiv">
              
          </div>
          <div className="priceDivWrapper">
              <h2>Prix pour chaque exécution public </h2>
              <p>Opus 1</p>
              <ul>
                <li key="1">le concert des profs : libre de droit</li>
                <li key="2">Musique de scène : 75€</li>
              </ul>
              <p>Opus 2</p>
              <ul>
                <li key="1">Duo : libre de droit</li>
                <li key="2">Trio : 80€</li>
              </ul>
              <p>Opus 3 : 150€</p>
              <p>Opus 4 : 70€</p>
              <p>Opus 5 : 120€</p>
              <p>Opus 6</p>
              <ul>
                <li key="1">Ragtime : 20 €</li>
                <li key="2">Sonatine drolatique : 120€</li>
              </ul>
              <p>Opus 7</p>
              <ul>
                <li key="1">5 petites pièces suaves : 15 €</li>
                <li key="2">8 petites pièces : Libre de droit</li>
                <li key="3">L'infant : Libre de droit</li>
                <li key="4">Spleen : 80€</li>
              </ul>
              <p>Opus 8 : 25€</p>
              <p>Opus 9</p>
              <ul>
                <li key="1">Andante et allegro : 70€</li>
                <li key="2">Fantaisie romantique : 70€</li>
                <li key="3">Laconique sonatine : 70€</li>
                <li key="4">Rapsodie fantasque : 80€</li>
              </ul>
              <p>Opus 10 : 180€</p>
              <p>Opus 11</p>
              <ul>
                <li key="1">Badinage : Libre de droit</li>
                <li key="2">L'aurore : 65€</li>
              </ul>
              <p>Opus 12 : 65€</p>
              <p>Opus 13 : 900€</p>
              <p>Opus 14 : 180€</p>
              <p>Opus 15</p>
              <ul>
                <li key="1">Improvisation : Libre de droit</li>
                <li key="2">eregrination 80€</li>
              </ul>
              <p>Opus 16 : </p>
              <ul>
                <li key="1">version 2000 250€</li>
                <li key="2">version trio 300€</li>
                <li key="3">version 2010 250€</li>
              </ul>
              <p>Opus 17 : Astarte ou Ishtar : 80€</p>
              <p>Opus 18 : Brocéliande version 2001 ou 2006 : 280€</p>
              <p>Opus 19 : </p>
              <ul>
                <li key="1">version 2000 : 850€</li>
                <li key="2">version 2008 : 960€</li>
              </ul>
              <p>Opus 20 : </p>
              <ul>
                <li key="1">Figure dans la ville trompette piano : 270€</li>
                <li key="2">Figure dans la ville  piano 4 mains : 280€</li>
                <li key="3">Ivresse 250€</li>
              </ul>
              <h2><a href="mailto: cyril.morin.tai@gmail.com">Contact : cyril.morin.tai@gmail.com</a></h2>
              
            </div>
            
          </div>
        }
        <div className="footer"></div>
      </div>
    );
  }

}

export default App;
