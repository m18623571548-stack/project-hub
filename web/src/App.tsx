import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import Tasks from './pages/Tasks'
import DataFiles from './pages/DataFiles'
import Members from './pages/Members'
import Activities from './pages/Activities'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/datafiles" element={<DataFiles />} />
          <Route path="/members" element={<Members />} />
          <Route path="/activities" element={<Activities />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
