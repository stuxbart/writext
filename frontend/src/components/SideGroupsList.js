import React from 'react'

const allGroups = {
    1:{
        id: 1,
        title: "grupa pierwsza",
        childrens: [2,3,4]
    },
    2:{
        id: 2,
        title: "grupa druga",
        childrens: []
    },
    3:{
        id: 3,
        title: "grupa trzecia",
        childrens: []
    },
    4:{
        id: 4,
        title: "grupa czwarta",
        childrens: []
    },
    5:{
        id: 5,
        title: "grupa piąta",
        childrens: []
    },
}

const rootGroups = [1,5]
function SideGroupList() {

    const renderSubGroups = (groups) => {
        console.log(groups)
        const exists = groups.length > 0
        if (!exists) return <></>
        return groups.map(id => {
            const group = allGroups[id]
            console.log(group)
            if (group === undefined) return <></>;

            return <li key={group.id}><a href="#" className="link-dark d-inline-flex text-decoration-none rounded">{group.title}</a></li>
        })
    }

    const renderGroups = () => {
        return rootGroups.map(id => {
            const group = allGroups[id]
            if (group === undefined) return <></>;
            const hasChildrens = group.childrens.length > 0
            return <>
            <li className="mb-1" key={group.id}>
                <button 
                    className={`btn ${hasChildrens ? "btn-toggle" : "btn-untoggle" } d-inline-flex align-items-center rounded border-0 collapsed` }
                    data-bs-toggle="collapse" 
                    data-bs-target={`#${group.id}-collapse`} 
                    aria-expanded="false">

                {group.title}
                </button>
                {hasChildrens ?
                    <div className="collapse" id={`${group.id}-collapse`}>
                        <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                        {renderSubGroups(group.childrens)}
                        </ul>
                    </div>
                : <></>}
            </li>
            </>
        })
    }

    return (
        // <div className="row">
    <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
      <div className="position-sticky pt-3">
        
          
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted text-uppercase">
          <span>Szablony</span>
          <a className="link-secondary" href="#" aria-label="Add a new report">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-plus-circle align-text-bottom" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </a>
        </h6>
        <ul className="nav flex-column mb-2">
          <li className="nav-item">
            <a className="nav-link" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-file-text align-text-bottom" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Wypracowanie
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-file-text align-text-bottom" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Raport PŁ
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-file-text align-text-bottom" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              cos
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-file-text align-text-bottom" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Year-end sale
            </a>
          </li>
        </ul>
        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted text-uppercase">
          <span>Projekty</span>
          <a className="link-secondary" href="#" aria-label="Add a new report">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-plus-circle align-text-bottom" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </a>
        </h6>
        
      </div>
      <ul className="list-unstyled ps-0">
        {renderGroups()}
      </ul>
    </nav>
    )
}



export default SideGroupList