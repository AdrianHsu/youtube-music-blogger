import React from 'react';
import {render} from 'react-dom';
import ButtonAppBar from './ButtonAppBar.js';
import PreviewArticle from './PreviewArticle.js';
import { Grid } from '@material-ui/core';
import InsetList from './InsetList.js';
import EditIcon from '@material-ui/icons/ModeEdit';
import Button from '@material-ui/core/Button';
import EditArticle from './EditArticle.js';
import axios from 'axios';

const styles = {
  bg: {
    backgroundSize: 'cover',
    // backgroundImage: 'url("/assets/blog.jpg")'
  }
};

class Blog extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username: "",
      hostname: "",
      title: "",
      time: "",
      content: "",
      hash: "",
      postList: [],
      mode: "preview"
    };
  }
  componentDidMount(){
    var retrievedObject = sessionStorage.getItem('userInfo');
    if(retrievedObject == null) {
      window.alert('登入無效，請重新登入！');
      this.props.history.push('/login');
    } else {
      // window.alert(retrievedObject + '\n登入成功！');
      // console.log(retrievedObject);
      retrievedObject = JSON.parse(retrievedObject);
      var username = retrievedObject.username;
      document.title = username;
      var host = this.props.location.pathname.split('/')[2];

      axios.get('/blog/list', {
        params: {
          hostname: host
        }
      })
      .then( (res) => {
        // console.log(res['data']);
        res.data.sort((a, b) => a.timestamp - b.timestamp); 
        for(var i = 0; i < res['data'].length; i++) {
          var post = res['data'][i];

          post['pressed'] = false;
          this.setState({
            postList: this.state.postList.concat(post),
          });
        }
        // this.forceUpdate();
      })
      .catch(function (error) {
        console.log(error);
      });
      if(host === username) {
        host = "您";
      }
      this.setState({
        username: username,
        hostname: host
      });

    }
  }
  funcArticle(){
    if(this.state.mode === "none"){
      return null;
    } else if(this.state.mode === "preview"){
      return <PreviewArticle title={this.state.title} time={this.state.time} content={this.state.content}
              handleEditCb={this.handleEditCb}/>;
    } else if(this.state.mode === "edit"){
      return <EditArticle 
        title={this.state.title} time={this.state.time} content={this.state.content}
        handleTitleCb={this.handleTitleCb} handleContentCb={this.handleContentCb}
        savePostCb={this.savePostCb} />;
    }
  }
  handleEditCb = (e) => {
    e.preventDefault();
    this.setState({
      mode: "edit",
    });
  }
  handleFab = (e) => {
    e.preventDefault();
    this.setState({
      mode: "edit",
      hash: "",
      title: "",
      time: "",
      content: "",
    
    });
  }
  handlePreviewCb = (hash) => {

    var tmpList = [];
    for(var i = 0; i < this.state.postList.length; i++) {
      var post = this.state.postList[i];
      if(post['hash'] === hash) {
        post['pressed'] = true;
        this.setState({
          title: post['title'],
          time: post['time'],
          content: post['content'],
          hash: post['hash']
        });
      } else {
        post['pressed'] = false;
      }
      tmpList.push(post);
    }
    this.setState({
      postList: tmpList,
      mode: "preview",
    });
  }
  handleTitleCb = (v) => {
    this.setState({
      title: v
    })
  }
  handleContentCb = (v) => {
    this.setState({
      content: v
    })
  }



  savePostCb = () => {
    var newPost = false;
    if(this.state.hash === ""){
      var hash = Math.random().toString(36).substr(2, 5);
      newPost = true;
    } else {
      var hash = this.state.hash;
    }
    var myres = null;
    this.setState({
      hash: hash
    }, () => {
      axios.put('/blog/post', {
        title: this.state.title,
        content: this.state.content,
        // timestamp: Date.now(),
        // time: Date,
        hash: this.state.hash,
        author: this.state.username
      })
      .then((res) => {
        console.log(res);
        myres = res.data;
        myres['pressed'] = false;

        if(newPost === true){
          this.setState({
            postList: this.state.postList.concat(myres),
            title: "",
            time: "",
            content: "",
            hash: "",
            mode: "preview"
          });
        } else {
          var tmpList = [];
          for(var i = 0; i < this.state.postList.length; i++) {
            var post = this.state.postList[i];
            if(post['hash'] === hash) {
    
              post = myres;
            } else {
              // do nothing
            }
            tmpList.push(post);
          }
          tmpList.sort((a, b) => a.timestamp - b.timestamp); 

          this.setState({
            postList: tmpList,
            title: "",
            time: "",
            content: "",
            hash: "",
            mode: "preview"
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      })
    })



  }

  render() {
    
    return (
    <div>
    <ButtonAppBar history={this.props.history} 
      username={this.state.username} 
      hostname={this.state.hostname}>
    </ButtonAppBar>
    <Grid container spacing={24}>
      <Grid item xs={12} sm={9}>
      {this.funcArticle()}
      </Grid>
      <Grid item xs={8} sm={2}>
      <InsetList mode={this.state.mode} handlePreviewCb={this.handlePreviewCb} postList={this.state.postList}/>
      </Grid>
    </Grid>
    <Button variant="fab" color="secondary" onClick={e => this.handleFab(e)}
      style={{position: 'absolute',
        bottom: 30,
        right: 30}}>
      <EditIcon/>
    </Button>

    </div>);
  }
}

export default Blog;