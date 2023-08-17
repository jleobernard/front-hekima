import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField/TextField";
import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from 'services/supabase-client';
import { notifyError } from 'store/features/notificationsSlice';
import LoadingMask from "../../components/loading-mask/loading-mask";
import "../../styles/layout.scss";

const Login = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const q = new URLSearchParams(useLocation().search);

  function doRedirect() {
    const redirect = q.get('redirect')
    if (redirect && !redirect.startsWith("/login") && !redirect.startsWith("/api/login")) {
      navigate(redirect)
    } else {
      navigate('/')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if(!loading) {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      setLoading(false)
      if(error) {
        console.error(error)
        notifyError("Impossible de se connecter")
      } else {
        doRedirect()
      }
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
    </div>
  );
}

export default Login;
