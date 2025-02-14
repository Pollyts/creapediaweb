import React, { Component } from "react";
import { Link } from "react-router-dom";
import Toolbar from "../Toolbar/ToolbarFolder";
import logo from "../App/logo4x.png";
import "./FolderPage.css";

export default class FolderPage extends Component {
  constructor(props) {
    super(props);
    this.state = { search:"", folders: null, elements: null, breadCrumbs: null };
    this.handleClick = this.handleClick.bind(this);
    this.Search = this.Search.bind(this);
  }
  handleClick(e) {
    e.preventDefault();
    this.props.history.push("/");
    localStorage.clear();
    window.location.reload();
  }

  Search(e) {
    this.setState({search: e.target.value})
  }

  async GetFolders(parentid) {
    const breadCrumbs = this.props.location.state.breadCrumbs;
    const index = breadCrumbs
      .map(function (e) {
        return e.body.Id;
      })
      .indexOf(this.props.location.state.body.Id);    
    if (index === -1) {
      breadCrumbs.push({
        title: this.props.location.state.body.Name,
        path: `/projects`,
        body: {
          Name: this.props.location.state.body.Name,
          Id: this.props.location.state.body.Id,
        },
      });
    } else {
      breadCrumbs.length = index + 1;
    }
    await fetch(process.env.REACT_APP_API_FOLDERS + `/${parentid}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.setState({ folders: data, breadCrumbs: breadCrumbs , search:"  "});
      })
      .catch((err) => console.log(err));
    console.log(this.state);
  }
  async GetElements(parentid) {
    await fetch(process.env.REACT_APP_API_ELEMENTS + `/${parentid}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.setState({ elements: data });
      })
      .catch((err) => console.log(err));
  }

  async componentDidMount() {
    await this.GetFolders(this.props.location.state.body.Id);
    await this.GetElements(this.props.location.state.body.Id);
  }
  async componentDidUpdate(prevProps) {
    console.log("Я в обновлении темплэйта");
    if (
      prevProps.location.state.body.Id !== this.props.location.state.body.Id
    ) {
      this.setState({
        search:"", folders: null, elements: null, breadCrumbs: null
      })
      await this.GetFolders(this.props.location.state.body.Id);
      await this.GetElements(this.props.location.state.body.Id);
      // window.location.reload();
    }
  }

  render() {
    if (!this.state.folders || !this.state.elements) {
      return <div className="waitingpage">
        <div className="Loading">
        <img className="logo" src={logo} alt="toolbaritem" />
        <label className="formlabel">Загрузка...</label>
        </div>
      </div>;
    }
    const { folders, elements, breadCrumbs } = this.state; //сначала
    return (
      <div className="folderPage">
        <div className="Header">
          <div className="BreadCrumbs">
            {breadCrumbs.map((bc) => (
              <div key={bc.title} className="gt">
                <Link
                  className="BreadCrumb"
                  to={{
                    pathname: bc.path,
                    state: { body: bc.body, breadCrumbs: breadCrumbs },
                  }}
                >
                  {bc.title}
                </Link>
                &ensp;&rarr;&ensp;
              </div>
            ))}
          </div>          
          <div className="settingsinheader">
          <input type="text" className="search" onChange={this.Search} placeholder="поиск" ></input>
            <Link
              to={{ pathname: `/library`, state: { breadCrumbs: breadCrumbs } }}
            >
              {<button className="btn_logout">общая библиотека</button>}
            </Link>
            <Link to={{ pathname: "/settings", state: { breadCrumbs: breadCrumbs } }}>
              {<button className="btn_logout">настройки</button>}
            </Link>
            {
              <button className="btn_logout" onClick={this.handleClick}>
                выход
              </button>
            }
            <img className="logo" src={logo} alt="toolbaritem" />
          </div>
        </div>
        {this.state.search==='  '?<div className="listview">
          {folders.map((folder) => (
            <div key={folder.Id}>
              <Link
                className="folderinlist"
                to={{
                  pathname: `/projects`,
                  state: { breadCrumbs: breadCrumbs, body: folder },
                }}
              >
                <div className="NameElementOfList">{folder.Name}</div>
              </Link>
            </div>
          ))}
          {elements.map((el) => (
            <div key={el.Id}>
              <Link
                className="elementinlist"
                to={{
                  pathname: `/element`,
                  state: { breadCrumbs: breadCrumbs, body: el },
                }}
              >
                {el.Image!==null?
                <img
                  className="elementimage"
                  src={`data:image/jpeg;base64,${el.Image}`}
                  alt="No Image"
                />
  :<div className="NoImage">No Image</div>}
                <div className="NameElementOfList">{el.Name}</div>
              </Link>
            </div>
          ))}          
        </div>:<div className="listview">
          {folders.filter(
          (rel) => rel.Name.includes(this.state.search)
        ).map((folder) => (
            <div key={folder.Id}>
              <Link
                className="folderinlist"
                to={{
                  pathname: `/projects`,
                  state: { breadCrumbs: breadCrumbs, body: folder },
                }}
              >
                <div className="NameElementOfList">{folder.Name}</div>
              </Link>
            </div>
          ))}
          {elements.filter(
          (rel) => rel.Name.includes(this.state.search)
        ).map((el) => (
            <div key={el.Id}>
              <Link
                className="elementinlist"
                to={{
                  pathname: `/element`,
                  state: { breadCrumbs: breadCrumbs, body: el },
                }}
              >
                {el.Image!==null?
                <img
                  className="elementimage"
                  src={`data:image/jpeg;base64,${el.Image}`}
                  alt="No Image"
                />
  :<div className="NoImage">No Image</div>}
                <div className="NameElementOfList">{el.Name}</div>
              </Link>
            </div>
          ))}          
        </div>}

        
        <div className="foldercomponents">
          <Toolbar
            previouspages={breadCrumbs}
            parent={this.props.location.state.body}
          ></Toolbar>
        </div>
      </div>
    );
  }
}
