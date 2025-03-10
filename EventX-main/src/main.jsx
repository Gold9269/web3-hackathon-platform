import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux'
import store from './store/store.js'
import Home from './components/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthLayout } from './components/index.js'
import Hackathon from './components/Hackathons.jsx'
import About from './components/About.jsx'
import Hackathons from './components/Hackathons.jsx'
import OrganizeEventForm from './pages/OrganizeEventForm.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children : [
      {
        path: '/',
        element: <Home/>
      },
      {
        path:'/resources',
        element:<OrganizeEventForm/>
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}> 
           <Login/>
          </AuthLayout>
        )
      },
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
          <Signup/>
          </AuthLayout>
        )
      },
      {
        path: "/dashboard",
        element:(
        <AuthLayout authentication={true}>
          <Home/>
        </AuthLayout>)
      },
      {
        path: "/about",
        element: (
          <About/>
        )
      },
      {
        path: "/browse-events",
        element: (
          <Hackathons/>
        )
      }
    ]
  }

]

)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <RouterProvider router={router}/>
  </Provider>
)
