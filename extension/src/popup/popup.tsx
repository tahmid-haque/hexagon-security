import React from 'react'
import ReactDOM from 'react-dom'
import { Card, Box, Button} from '@mui/material';
import { createTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close';
import './popup.css'
import './signin.css'

const SigninPage = () => {
  const onClickSignin = () => {
    console.log("signin to app")
  }

  return (
    <div className='signin-page'>
      <div className='signin-dialog'>
        <div className='signin-message'>You are not logged in</div>
        <Button variant="outlined" color="inherit" size='large' onClick={onClickSignin}>Sign In</Button>
      </div>
    </div>
  )
}

type User = {
  name: string
}

const Greet = ({ name }: User) => {
  return <h1>Hello {name}</h1>
}

const PopupBody = ({ name }: User) => {
  if(!name){
    return <SigninPage />
  }
  return <Greet name={name} />
}

const Header = () => {
  const onClickClose = () => {
    console.log("close popup");
    window.close();
  }

  return (
    <div>
      <div className='top-border'></div>
      <Card>
        <div className='header-container'>
          <div className='header'>
            <img src="icon.png" className="icon"/> 
            <div className='title'>HEXAGON</div>
          </div>
          <Box m={1}>
            <CloseIcon onClick={onClickClose} color="action"></CloseIcon>
          </Box>
        </div>
      </Card>
    </div>
  )
}

const App = () => {
  return (
    <div>
      <Header />
      {/* <PopupBody name={null} /> */}
      <PopupBody name={"yellow"} />
    </div>
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(<App />, root)
