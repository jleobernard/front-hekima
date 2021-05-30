import React, {useEffect, useState} from 'react';
import {useHistory, useLocation, withRouter} from "react-router-dom";
import {get, post} from "../../utils/http";
import "../../styles/layout.scss";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField/TextField";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import Toaster from "../../components/Toaster";
import LoadingMask from "../../components/loading-mask/loading-mask";

const Login = () => {

  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const q = new URLSearchParams(useLocation().search);

  function doRedirect(response) {
    const redirect = q.get('redirect')
    if (redirect && !redirect.startsWith("/login") && !redirect.startsWith("/api/login")) {
      history.push(redirect)
    } else {
      history.push('/')
    }
  }

  useEffect(() => {
    setLoading(true)
    get('/api/authentication:status', {}, false)
    .then(response => {
      if(response.authenticated) {
        doRedirect(response)
      }
    }).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if(!loading) {
      setLoading(true)
      post('/api/login', {username: email, password}, false)
      .then(response => {
        doRedirect(response)
      })
      .catch(err => {
        setError("Impossible de se connecter")
      }).finally(() => setLoading(false))
    }
  }

  return (
    <div className="app">
      <form onSubmit={handleSubmit} className="form">
        <FormControl>
          <TextField id='email' label="Email" required value={email}
                     variant="outlined" onChange={e => setEmail(e.target.value)} />
        </FormControl>
        <FormControl>
          <TextField id='password' label="Mot de passe" required value={password}
                     type="password" variant="outlined" onChange={e => setPassword(e.target.value)} />
        </FormControl>
        <ButtonGroup className="button-group">
          <Button type='submit' color="primary" className="block">Connexion</Button>
        </ButtonGroup>
      </form>
      <LoadingMask loading={loading}/>
      <Toaster error={error}/>
    </div>
  );
}

export default withRouter(Login);
