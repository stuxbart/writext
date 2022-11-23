import React, { useEffect, useState } from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import "./styles/App.scss";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Error404 from "./pages/Error404";
import Projects from "./pages/Projects";
import ProjectEdit from "./pages/ProjectEdit";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import RegisterCorfirm from "./pages/RegisterDone";
import Modals from "./components/Modals";
import { useAppDispatch, useAppSelector } from "./hooks";
import { clearEditorData } from "./features/editor/newEditorSlice";
import AOR from "./components/Common/AuthenticatedOnlyRoute";
import { selectAuthLoading } from "./features/auth/authSlice";
import { hideLoaderScreen, showLoaderScreen } from "./utils/loader";

function App(): JSX.Element {
  const [isChildReady, setIsChildReady] = useState(false);
  const isLoading = useAppSelector(selectAuthLoading);
  const isEditor = useMatch("/project/:projectId");
  const isProjectList = useMatch("/projects/");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isEditor) {
      dispatch(clearEditorData());
    }
  }, [isEditor, dispatch]);

  useEffect(() => {
    const isChildRdy = isEditor || isProjectList ? isChildReady : true;

    if (!isLoading && isChildRdy) {
      hideLoaderScreen();
    } else {
      showLoaderScreen();
    }
  }, [isLoading, isChildReady, isEditor, isProjectList]);

  const handleChildLoaded = (statestatus: boolean) => {
    setIsChildReady(statestatus);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="logout" element={<Logout />} />
        <Route path="register" element={<Register />} />
        <Route path="register-done" element={<RegisterCorfirm />} />
        <Route path="projects">
          <Route
            path=":folderId"
            element={
              <AOR>
                <Projects setReady={handleChildLoaded} />
              </AOR>
            }
          />
          <Route
            path=""
            element={
              <AOR>
                <Projects setReady={handleChildLoaded} />
              </AOR>
            }
          />
        </Route>
        <Route
          path="project/:projectId"
          element={
            <AOR>
              <ProjectEdit setReady={handleChildLoaded} />
            </AOR>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Routes>
      <Modals />
    </>
  );
}

export default App;
