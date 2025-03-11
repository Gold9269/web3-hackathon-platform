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
import About from './components/About.jsx'
import Event from "./components/Event.jsx"
import OrganizeEventForm from './components/Organize.jsx'
import EventPage from './components/EventPage.jsx'
import AddRound from './components/AddRound.jsx'
import TeamDashboard from './components/TeamDashboard.jsx'
import Participants from './components/Participants.jsx'


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
        path: "/organize",
        element:(
        <AuthLayout authentication={true}>
          <OrganizeEventForm/>
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
          <Event/>
        )
      },
      {
        path:"/hackathon/:id",
        element:(
          <EventPage/>
        )
      },
      {
        path:"/:id/rounds/add",
        element:(
          <AuthLayout authentication={true}>
          <AddRound/>
          </AuthLayout>
        )
      },
      {
        path: "/:id/participants",
        element:(
          <AuthLayout authentication={true}>
            <TeamDashboard/>
          </AuthLayout>
        )
      },
      {
        path: "/team/:teamId",
        element:(
          <AuthLayout authentication={true}>
            <Participants/>
          </AuthLayout>
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

