import { useEffect, useState } from "react";
import DashCSS from "/public/styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";

interface User {
    username: string;
    email: string;
    id: string;
}
interface files {
  id: number;
  file_path: string;
  file_name: string;
  file_size:  number;
  file_type: string;
  updated_at: string;
  created_at: string
}
interface shareFile {
  file_path: string;
  file_name: string;
  email: string;
  file_size:  number;
  file_type: string;
}
type HowToSort = 
  | "Date created (Newest)"
  | "Date created (Oldest)"
  | "File size (Highest)"
  | "File size (Lowest)"
  | "Name (A-Z)"
  | "Name (Z-A)";

export default function Dashboard(){

  const navigateTo = useNavigate();


    const [Sharefile, setShareFile] = useState<shareFile | null>(null);
    const [files, setFiles] = useState<files[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [filesSize, setFilesSize] = useState<number>(0);
    const [ISMB, setISMB] = useState<boolean>(false);
    const [openSettingsId, setOpenSettingsId] = useState<number | null>(null);
    const [openSearchedSettingsId, setOpenSearchedSettingsId] = useState<number | null>(null);
    const [openAreYouSure, setopenAreYouSure] = useState<number | null>(null);
    const [openAreYouSureRename, setopenAreYouSureRename] = useState<number | null>(null);
    const [openInfo, setopenInfo] = useState<number | null>(null);
    const [openShare, setopenShare] = useState<number | null>(null);
    const [rename, setRename] = useState<string>("");
    const [emailSend, setEmailSend] = useState<string>("");
    const [searchBar, setSearchBar] = useState<string>("");
    const [isVisible, setIsVisible] = useState(false);
    const [select, setSelect] = useState<HowToSort>('Date created (Newest)');
    const [searchedFiles, setSearchedFiles] = useState<files[]>([]);

    const handleSearchBar = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchBar(event.target.value);
    };

    useEffect(() => {
      const fetchSearchedFiles = async () => {
        if (searchBar == ''){
          setSearchedFiles([])
        }else{
          try {
            const token = localStorage.getItem("authToken");
            if (!token) {
              throw new Error("No token found. Please log in.");
            }
            const response = await fetch(`http://localhost:8000/api/search?file_name=${searchBar}&user_id=${user?.id}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
        
            if (!response.ok) {
              throw new Error("Failed to fetch files");
            }
        
            const data = await response.json();
            console.log(data)
            setSearchedFiles(data);
          } catch (error) {
            console.error("Error fetching files:", error);
          }
        };
      }
      fetchSearchedFiles()
    }, [searchBar])

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelect(event.target.value as HowToSort);
    };

  useEffect(() => {
    if (openSettingsId || openSearchedSettingsId) {
      setTimeout(() => {
        setIsVisible(true);
      }, 10); 
    } else {
      setIsVisible(false);
    }
  }, [openSettingsId, openSearchedSettingsId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setRename(e.target.value);
    };
    const handlEmaileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmailSend(e.target.value);
    };

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            throw new Error("No token found. Please log in.");
          }
  
          const response = await fetch(`http://localhost:8000/api/userData?token=${token}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            navigateTo('/login')
          }
  
          const data = await response.json();
          setUser({username: data.user.username,email: data.user.email,  id: data.user.id});
          // console.log(user)
        } catch (error) {
          console.error("Error fetching user data:", error);
          navigateTo('/Login')
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserData();
    }, []);

    const fetchFiles = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            throw new Error("No token found. Please log in.");
          }
          const response = await fetch(`http://localhost:8000/api/list?user_id=${user?.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
      
          if (!response.ok) {
            throw new Error("Failed to fetch files");
          }
      
          const data = await response.json();
          const files = data.files.filter((file: { file_type: string; }) => file.file_type === 'pdf' || file.file_type === 'docx');
          if(select === 'Date created (Newest)'){
              files.sort((a: { created_at: number; }, b: { created_at: number; }) => a.created_at - b.created_at);
          }else if(select === 'Date created (Oldest)'){
              files.sort((a: { created_at: number; }, b: { created_at: number; }) => b.created_at - a.created_at);
          }else if(select === 'File size (Highest)'){
              files.sort((a: { file_size: number; }, b: { file_size: number; }) => a.file_size - b.file_size);
          }else if(select === 'File size (Lowest)'){
              files.sort((a: { file_size: number; }, b: { file_size: number; }) => b.file_size - a.file_size);
          }else if(select === 'Name (A-Z)'){
              files.sort((a: { file_name: string }, b: { file_name: string }) => {
              const firstLetterA = a.file_name.charAt(0).toLowerCase();
              const firstLetterB = b.file_name.charAt(0).toLowerCase();
              if (firstLetterA < firstLetterB) {
                return -1;
              } else if (firstLetterA > firstLetterB) {
                return 1;
              } else {
                return 0;
              }
            });
          }else if(select === 'Name (Z-A)'){
              files.sort((a: { file_name: string }, b: { file_name: string }) => {
              const firstLetterA = a.file_name.charAt(0).toLowerCase();
              const firstLetterB = b.file_name.charAt(0).toLowerCase();
              if (firstLetterA > firstLetterB) {
                return -1;
              } else if (firstLetterA < firstLetterB) {
                return 1;
              } else {
                return 0;
              }
            });
          }
          // data.files.sort((a: { file_size: number; }, b: { file_size: number; }) => a.file_size - b.file_size);
          // console.log(sortedAscending);
  
          let TempfilesSize = files.reduce((sum: number, file: { file_size: number; }) => sum + Number(file.file_size) || 0, 0);
          if(TempfilesSize > 1024){
              TempfilesSize = Math.round(TempfilesSize / 1024 * 100) / 100;
              setISMB(true);
          }
          setFilesSize(TempfilesSize);
          setFiles(files);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      };
  
    useEffect(() => {
      if (user?.id) {
        fetchFiles();
      }
    }, [user?.id, select]);
  

    async function logout(){
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:8000/api/logout?token=${token}`,{
          method:"POST",
          headers:{
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        localStorage.removeItem("authToken")
        navigateTo("/Login")
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    const handleUpload = async (file: File) => {
      const formData = new FormData();
      formData.append('file_path', file);
      formData.append('user_id', user?.id || '');
      formData.append('file_name', file.name);
  
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:8000/api/addFile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error("Failed to upload file");
        }
  
        await fetchFiles();
        alert("File uploaded successfully!");
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file.");
      }
    };

    const handleShare = async (file_path: string, file_name: string, email: string, file_type: string, file_size: number) => {
      setShareFile({ file_path, file_name, email, file_type, file_size });
    };
    
    useEffect(() => {
      const shareFile = async () => {
        if (Sharefile) {
          try {
            const response = await fetch("http://localhost:8000/api/shareFile", {
              method: "POST",
              body: JSON.stringify(Sharefile),
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            });
    
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            setOpenSettingsId(null)
            setOpenSearchedSettingsId(null)
            setopenShare(null)
            alert("File shared successfully!");
          } catch (error) {
            console.error('Error sharing file:', error);
          }
        }
      };
    
      shareFile();
    }, [Sharefile]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
    
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}${ampm}`;
    
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const formattedDate = `${day} ${month}`;
    
      return `${formattedTime}, ${formattedDate}`;
    };

    async function deleteFile(id:number) {
      try {
        const response = await fetch(`http://localhost:8000/api/deleteFile?id=${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
  
        if (response.ok) {
          setopenAreYouSure(null)
          setOpenSettingsId(null)
          setOpenSearchedSettingsId(null)
          await fetchFiles();
        } else {
          throw response;
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    }

    async function changeName(id:number) {
      try {
        const response = await fetch(`http://localhost:8000/api/changeName`, {
          method: "POST",
          body: JSON.stringify({ file_name: rename, id: id }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
  
        if (response.ok) {
          setopenAreYouSureRename(null)
          setRename("")
          setOpenSettingsId(null)
          setOpenSearchedSettingsId(null)
          await fetchFiles();
        } else {
          throw response;
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    }

    const handleDownload = (filePath: string, fileName: string) => {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = `http://localhost:8000/storage/file_path/${filePath}`;
      link.download = fileName; // Set the download filename
      document.body.appendChild(link); // Append to the DOM (required for Firefox)
      link.click(); // Programmatically click the link to trigger the download
      document.body.removeChild(link); // Clean up and remove the link from the DOM
  };
  
    if (loading) return <div className="loader"></div>;
    console.log(searchedFiles)

    return(
      <div className={` h-full w-full flex-row flex `}>
      {/* Overlay */}
      { ( openAreYouSure || openAreYouSureRename || openInfo || openShare) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
            zIndex: 1000, // Ensure it's above the dashboard but below the "areYouSure" div
          }}
        />
      )}
            <div className={`${DashCSS.leftPart}`}>
                <div className="flex-col flex gap-5">
                    <div className={`${DashCSS.logoDiv}`}>
                        <img src="/src/assets/Screenshot 2025-01-29 122928.png" alt="" />
                    </div>
                    <div className="buttonsContainer flex flex-col gap-6">
                            <button
                            onClick={() => navigateTo('/Dashboard')}
    className={`${DashCSS.buttonDiv} cursor-pointer bg-white text-black relative inline-flex ml-4 pl-12 items-center gap-4 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-3`}
  >
    <svg
      className="lucide lucide-rocket fill-gray-400 text-gray-400 dark:text-black stroke-gray-400"
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke-width="2"
      stroke="#60A5FA"
      fill="white"
      viewBox="0 0 24 24"
      height="22"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
      ></path>
      <path
        d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
      ></path>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
    </svg>
    Dashboard
  </button>

  <button
    className={`${DashCSS.DashbuttonDiv} cursor-pointer bg-[#FB7276] text-white relative inline-flex ml-4 pl-12 items-center gap-4 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-3`}
  >
    <svg
      className="lucide lucide-rocket text-gray-400 dark:text-gray-400 stroke-gray-400"
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke-width="2"
      stroke="#60A5FA"
      fill="white"
      viewBox="0 0 24 24"
      height="22"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
      ></path>
      <path d="M18 14h-8"></path>
      <path d="M15 18h-5"></path>
      <path d="M10 6h8v4h-8V6Z"></path>
    </svg>
    Documents
  </button>

  <button
    className={`${DashCSS.buttonDiv} cursor-pointer bg-white text-black relative inline-flex ml-4 pl-12 items-center gap-4 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-3`}
    onClick={() => navigateTo('/Images')}
  >
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`${DashCSS.svg} fill-gray-400`}>
      <path
        d="M20 5H4V19L13.2923 9.70649C13.6828 9.31595 14.3159 9.31591 14.7065 9.70641L20 15.0104V5ZM2 3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934ZM8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11Z"
      ></path>
    </svg>
    Images
  </button>

  <button
    className={`${DashCSS.buttonDiv} cursor-pointer bg-white text-black relative inline-flex ml-4 pl-12 items-center gap-4 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-3`}
    onClick={() => navigateTo('/Media')}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 512 512" stroke-width="0" fill="currentColor" stroke="currentColor" className="video-icon fill-gray-400">
          <path d="M464 384.39a32 32 0 01-13-2.77 15.77 15.77 0 01-2.71-1.54l-82.71-58.22A32 32 0 01352 295.7v-79.4a32 32 0 0113.58-26.16l82.71-58.22a15.77 15.77 0 012.71-1.54 32 32 0 0145 29.24v192.76a32 32 0 01-32 32zM268 400H84a68.07 68.07 0 01-68-68V180a68.07 68.07 0 0168-68h184.48A67.6 67.6 0 01336 179.52V332a68.07 68.07 0 01-68 68z"></path>
        </svg>
    Media
  </button>

  <button
    className={`${DashCSS.buttonDiv} cursor-pointer bg-white text-black relative inline-flex ml-4 pl-12 items-center gap-4 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-3`}
    onClick={() => navigateTo('/Others')}
  >
    <svg
          id="menu-dots-circle"
          viewBox="0 0 24 24"
          className="h-7 w-6 fill-gray-400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12C9 12.5523 8.55228 13 8 13 7.44772 13 7 12.5523 7 12 7 11.4477 7.44772 11 8 11 8.55228 11 9 11.4477 9 12zM13 12C13 12.5523 12.5523 13 12 13 11.4477 13 11 12.5523 11 12 11 11.4477 11.4477 11 12 11 12.5523 11 13 11.4477 13 12zM17 12C17 12.5523 16.5523 13 16 13 15.4477 13 15 12.5523 15 12 15 11.4477 15.4477 11 16 11 16.5523 11 17 11.4477 17 12z"
            className="fill-gray-400"
          ></path>
          <path
            clip-rule="evenodd"
            d="M12 2.75C10.3139 2.75 8.73533 3.20043 7.37554 3.98703C7.017 4.19443 6.5582 4.07191 6.3508 3.71337C6.14339 3.35482 6.26591 2.89602 6.62446 2.68862C8.2064 1.77351 10.0432 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12C1.25 10.0432 1.77351 8.2064 2.68862 6.62446C2.89602 6.26591 3.35482 6.14339 3.71337 6.3508C4.07191 6.5582 4.19443 7.017 3.98703 7.37554C3.20043 8.73533 2.75 10.3139 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75Z"
            fill-rule="evenodd"
            className="fill-gray-400"
          ></path>
        </svg>
    Others
  </button>

                    </div>
                    <div className={`${DashCSS.bottomImageLayerContainer}`}>
                        <div className={`${DashCSS.bottomImageLayer}`}>
                            <div className={`${DashCSS.bottomImage}`}>
                                <img src="/src/assets/Screenshot 2025-01-29 154011-Photoroom.png" alt="" className={`${DashCSS.imageDiv}`} />
                            </div>
                        </div>
                    </div>
                    <div className={`${DashCSS.usernameAndEmailContainer}`}>
                        <div className={`${DashCSS.userImageusername} flex flex-row`}>
                            <div className={`${DashCSS.userImage} ml-4`}>
                            <svg className="w-12 h-12 stroke-gray-400" stroke="currentCoglor" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>
                            </div>
                            <div className={`${DashCSS.usernameAndEmail} flex flex-col`}>
                                <div className={`${DashCSS.usernmae}`}>{user?.username}</div>
                                <div className={`${DashCSS.email}`}>{user?.email}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${DashCSS.rightPart} flex flex-col pl-4`}>
              <div className={`${DashCSS.header} flex flex-row justify-between`}>
                <div className={`${DashCSS.searchBar}`}>
                <form className={`${DashCSS.form}`}>
      <button>
          <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
              <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
      </button>
      <input className={`${DashCSS.input}`} id="searchBar" value={searchBar} onChange={handleSearchBar} placeholder="Type your text" type="text" />
      <button className={`${DashCSS.reset}`} type="reset" onClick={() => setSearchBar('')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
      </button>
  </form>
  <div className={`${DashCSS.searchedFiles}`}>
    <div className="flex flex-col h-full pr-4">
{searchedFiles.map((file) => (
  <div className={`${DashCSS.searchedFile} items-center`}>
        <div className={DashCSS.searchedFileImage}>
        {file.file_type === "png" || file.file_type === "jpg" || file.file_type === "jpeg" ? (
            <img className={DashCSS.cardImage} src={'http://localhost:8000/storage/file_path/'+file.file_path} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'pdf' ? (
            <img className={DashCSS.cardImage} src={'/src/assets/pdf_svgrepo_com.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'docx' ? 
          ( <img className={DashCSS.cardImage} src={'/src/assets/download.jpeg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> 
            
          ): <img className={DashCSS.cardImage} src={'/src/assets/music.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> }
        </div>
        <div className={`${DashCSS.searchedFileName}`}>
          {file.file_name}
        </div>
        <div className="ml-12">
        {formatDate(file.created_at)}
        </div>
        <button className={`${DashCSS.Searchbutton}`} onClick={() => setOpenSearchedSettingsId(openSearchedSettingsId === file.id ? null : file.id)}>
    <svg
      className={DashCSS.settings_btn}
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      fill="#e8eaed"
    >
      <path
        d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 ```html
99t99.5 41Zm-2-140Z"
      ></path>
    </svg>
    <span className={DashCSS.tooltip}>settings</span>
    {openSearchedSettingsId === file.id && (
<div className={`${DashCSS.hiddenCard} ${isVisible ? DashCSS.show : ""}`}>
  <div className={`${DashCSS.hiddenFileName} truncate`}>{file.file_name}</div>
  <div className={`${DashCSS.element}`} onClick={() => setopenAreYouSureRename(openAreYouSureRename === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg}`}>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ABDAD0"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-pencil"
      >
        <path
          d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
        ></path>
        <path d="m15 5 4 4"></path>
      </svg>
    </div>
    <div className={`${DashCSS.elementText}`}>Rename</div>
  </div>
  <div className={`${DashCSS.element}`} onClick={() => setopenInfo(openInfo === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg} h-6 w-6`}>
      <img src="/src/assets/info.png" alt="" />
    </div>
    <div className={`${DashCSS.elementText}`}>Info</div>
  </div>
  <div className={`${DashCSS.element}`} onClick={() => setopenShare(openShare === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg}`}>
    <svg
      className="share-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="#D3C2B4"
    >
      <path
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
      ></path>
    </svg>
    </div>
    <div className={`${DashCSS.elementText}`}>Share</div>
  </div>
  <div className={`${DashCSS.element}`}>
    <div className={`${DashCSS.elementImg} w-5`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" id="bdd05811-e15d-428c-bb53-8661459f9307" data-name="Layer 2" stroke="#65AAC9" className="svg"><path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path><path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path><path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path></svg>
    </div>
    <div className={`${DashCSS.elementText}`} onClick={() => handleDownload(file.file_path, file.file_name)}>Download</div>
  </div>
  <div className={`${DashCSS.element}`} onClick={() => setopenAreYouSure(openAreYouSure === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg}`}>
    <svg
        className="lucide lucide-trash-2"
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2"
        stroke="#B74D67"
        fill="none"
        viewBox="0 0 24 24"
        height="24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        <line y2="17" y1="11" x2="10" x1="10"></line>
        <line y2="17" y1="11" x2="14" x1="14"></line>
      </svg>
    </div>
    <button className={`${DashCSS.elementText}`}>Delete</button>
  </div>
</div>
)}
  </button>
  
{openShare === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
      <div className="w-full flex flex-row justify-center">
        <div>Share</div>
        <div className={`${DashCSS.infoExitImageDiv}`}>
<ul className="mb-4 mt-4 list-none space-x-1">
  <li className="inline-block text-left">
    <div
      className="relative mb-1 inline-block cursor-pointer select-none overflow-hidden whitespace-nowrap rounded p-2 text-center align-middle text-xs font-medium leading-5 tracking-wide text-slate-800 transition duration-300 ease-linear hover:text-blue-400 hover:shadow-2xl hover:shadow-blue-600"
      onClick={() => { setopenShare(null); setOpenSearchedSettingsId(null); }}
    >
      <span className="sr-only hidden">Twitter</span>
      <svg
        stroke="currentColor"
        fill="currentColor"
        aria-label="Twitter"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-8 w-8 fill-current"
      >
        <g>
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          ></path>
        </g>
      </svg>
    </div>
  </li>
</ul>
</div>
      </div>
    <div  className={`${DashCSS.infoNameAndImage}`}>
      <div className={DashCSS.infoCardImageDiv}>
      {file.file_type === "png" || file.file_type === "jpg" || file.file_type === "jpeg" ? (
            <img className={DashCSS.cardImage} src={'http://localhost:8000/storage/file_path/'+file.file_path} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'pdf' ? (
            <img className={DashCSS.cardImage} src={'/src/assets/pdf_svgrepo_com.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'docx' ? 
          ( <img className={DashCSS.cardImage} src={'/src/assets/download.jpeg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> 
            
          ): <img className={DashCSS.cardImage} src={'/src/assets/music.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> }
      </div>
      <div className={`${DashCSS.infoRightPart}`}>
        <div className={`${DashCSS.infoFileName}`}>{file.file_name}</div>
        <div className={`${DashCSS.infoFileDate}`}>{formatDate(file.created_at)}</div>
      </div>
    </div>
    <div className={`${DashCSS.sahreFileSentemce}`}>Share file with other users</div>
    <div className={`${DashCSS.emailSendDiv}`}>
    <input type="email" value={emailSend} onChange={handlEmaileChange}  id="email" className={`${DashCSS.emailInput}`}  placeholder={`Enter email address`} />
    </div>
    <div className={`${DashCSS.sureAndCancleDiv}`}>
      <div className={`${DashCSS.cancle}`}>
      <button className={`${DashCSS.cancleButton}`} onClick={() => {setopenShare(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}>Cancle</button>
      </div>
      <div className={`${DashCSS.sure}`}>
      <button className={`${DashCSS.sureButton}`} onClick={() => handleShare(file.file_path, file.file_name, emailSend, file.file_type, file.file_size)}>Share</button>
      </div>
    </div>
  </div>
)}
{openInfo === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
      <div className="w-full flex flex-row justify-center">
        <div>Details</div>
        <div className={`${DashCSS.infoExitImageDiv}`}>
<ul className="mb-4 mt-4 list-none space-x-1">
  <li className="inline-block text-left">
    <div
      className="relative mb-1 inline-block cursor-pointer select-none overflow-hidden whitespace-nowrap rounded p-2 text-center align-middle text-xs font-medium leading-5 tracking-wide text-slate-800 transition duration-300 ease-linear hover:text-blue-400 hover:shadow-2xl hover:shadow-blue-600"
      onClick={() => { setopenInfo(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}
    >
      <span className="sr-only hidden">Twitter</span>
      <svg
        stroke="currentColor"
        fill="currentColor"
        aria-label="Twitter"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-8 w-8 fill-current"
      >
        <g>
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          ></path>
        </g>
      </svg>
    </div>
  </li>
</ul>
</div>
      </div>
    <div  className={`${DashCSS.infoNameAndImage}`}>
      <div className={DashCSS.infoCardImageDiv}>
      {file.file_type === "png" || file.file_type === "jpg" || file.file_type === "jpeg" ? (
            <img className={DashCSS.cardImage} src={'http://localhost:8000/storage/file_path/'+file.file_path} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'pdf' ? (
            <img className={DashCSS.cardImage} src={'/src/assets/pdf_svgrepo_com.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'docx' ? 
          ( <img className={DashCSS.cardImage} src={'/src/assets/download.jpeg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> 
            
          ): <img className={DashCSS.cardImage} src={'/src/assets/music.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> }
      </div>
      <div className={`${DashCSS.infoRightPart}`}>
        <div className={`${DashCSS.infoFileName}`}>{file.file_name}</div>
        <div className={`${DashCSS.infoFileDate}`}>{formatDate(file.created_at)}</div>
      </div>
    </div>
    <div className={`${DashCSS.infoDetails}`}>
      <div className={`${DashCSS.infoDetailsCategoryPart}`}>
        <div className={`${DashCSS.infocategories}`}>Format:</div>
        <div className={`${DashCSS.infocategories}`}>Size:</div>
        <div className={`${DashCSS.infocategories}`}>Owner:</div>
        <div className={`${DashCSS.infocategories}`}>Last edited:</div>
      </div>
      <div className={`${DashCSS.infoDetailsCategoryPart}`}>
      <div className={`${DashCSS.infocategoriesValue}`}>{file.file_type}</div>
      <div className={`${DashCSS.infocategoriesValue}`}>{file.file_size<1024?  file.file_size+' KB': (Math.round(file.file_size / 1024 * 100) / 100)+' MB'}</div>
      <div className={`${DashCSS.infocategoriesValue}`}>{user?.username}</div>
      <div className={`${DashCSS.infocategoriesValue}`}>{formatDate(file.updated_at)}</div>
      </div>
    </div>
  </div>
)}
{openAreYouSureRename === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
    <div>Rename</div>
    <div  className={`${DashCSS.AreYouSureSentenceRename}`}><input type="text" value={rename} onChange={handleChange}  id="rename" className="w-full h-full border-2 border-black"  placeholder={`${file.file_name}`} /></div>
    <div className={`${DashCSS.sureAndCancleDiv}`}>
      <div className={`${DashCSS.cancle}`}>
      <button className={`${DashCSS.cancleButton}`} onClick={() => {setopenAreYouSureRename(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}>Cancle</button>
      </div>
      <div className={`${DashCSS.sure}`}>
      <button className={`${DashCSS.sureButton}`} onClick={() => changeName(file.id)}>Rename</button>
      </div>
    </div>
  </div>
)}
  {openAreYouSure === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
    <div>Delete</div>
    <div  className={`${DashCSS.AreYouSureSentence}`}>Are you sure you want to delete <span className="text-red-600">{file.file_name}?</span></div>
    <div className={`${DashCSS.sureAndCancleDiv}`}>
      <div className={`${DashCSS.cancle}`}>
      <button className={`${DashCSS.cancleButton}`} onClick={() => {setopenAreYouSure(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}>Cancle</button>
      </div>
      <div className={`${DashCSS.sure}`}>
      <button className={`${DashCSS.sureButton}`} onClick={() => deleteFile(file.id)}>Delete</button>
      </div>
    </div>
  </div>
) }
      </div>
))}
      

    </div>
  </div>
                </div>
                <div className="FileUploaderAndLogout flex flex-row gap-8">
  <div className="fileUploader">
    <input
      type="file"
      id="fileInput"
      style={{ display: 'none' }}
      onChange={handleFileChange}
    />




    {/* <button
      className={`${DashCSS.Btn}`}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      Choose File
    </button> */}

    <button className={`${DashCSS.cssbuttons_io_button}`} onClick={() => document.getElementById('fileInput')?.click()}>
 <svg viewBox="0 0 640 512" fill="white" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path></svg>
  <span>Upload</span>
</button>


    
  </div>
  <div className={`${DashCSS.LogoutDiv}`}>
    <button className={`${DashCSS.Btn}`} onClick={logout}>
      <div className={`${DashCSS.sign}`}>
        <svg viewBox="0 0 512 512" className="fill-[#fa9ca7]">
          <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
        </svg>
      </div>
    </button>
  </div>
</div>
              </div>
              <div className={`${DashCSS.body}`}>

                <div className={`${DashCSS.bodyHead}`}>
                  <div className={`${DashCSS.bodyHeadTop}`}>
                    <div className={`${DashCSS.Dashboard}`}>Dashboard</div>
                  </div>
                  <div className={`${DashCSS.bodyHeadBottom}`}>
                    <div>Total: <span className={`${DashCSS.filesNumber}`}>{filesSize+(ISMB?' MB':' KB')}</span></div>
                    <div><span className={`${DashCSS.soryBySpan}`}>sort by: </span><select value={select} onChange={handleSelectChange} name="sort" id="sort">
                                                                    <option value='Date created (Newest)'>Date created (Newest)</option>
                                                                    <option value="Date created (Oldest)">Date created (Oldest)</option>
                                                                    <option value="File size (Highest)">File size (Highest)</option>
                                                                    <option value="File size (Lowest)">File size (Lowest)</option>
                                                                    <option value="Name (A-Z)">Name (A-Z)</option>
                                                                    <option value="Name (Z-A)">Name (Z-A)</option>
                                                                  </select>
                    </div>
                  </div>
                </div>

                <div className="w-full justify-center flex">
                  {files.length==0? <div className={`${DashCSS.noFiles} flex justify-center items-center w-full h-full`}>No files found. Start by uploading your first file!</div> : 
                <div className={DashCSS.cardsContainer}>
  {files.map((file) => (
    <div className={DashCSS.card} key={file.id}>

{openSettingsId === file.id && (
<div className={`${DashCSS.hiddenCard} ${isVisible ? DashCSS.show : ""}`}>
  <div className={`${DashCSS.hiddenFileName} truncate`}>{file.file_name}</div>
  <div className={`${DashCSS.element}`} onClick={() => setopenAreYouSureRename(openAreYouSureRename === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg}`}>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ABDAD0"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-pencil"
      >
        <path
          d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
        ></path>
        <path d="m15 5 4 4"></path>
      </svg>
    </div>
    <div className={`${DashCSS.elementText}`}>Rename</div>
  </div>
  <div className={`${DashCSS.element}`} onClick={() => setopenInfo(openInfo === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg} h-6 w-6`}>
      <img src="/src/assets/info.png" alt="" />
    </div>
    <div className={`${DashCSS.elementText}`}>Info</div>
  </div>
  <div className={`${DashCSS.element}`} onClick={() => setopenShare(openShare === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg}`}>
    <svg
      className="share-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="#D3C2B4"
    >
      <path
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
      ></path>
    </svg>
    </div>
    <div className={`${DashCSS.elementText}`}>Share</div>
  </div>
  <div className={`${DashCSS.element}`}>
    <div className={`${DashCSS.elementImg} w-5`}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" id="bdd05811-e15d-428c-bb53-8661459f9307" data-name="Layer 2" stroke="#65AAC9" className="svg"><path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path><path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path><path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path></svg>
    </div>
    <div className={`${DashCSS.elementText}`} onClick={() => handleDownload(file.file_path, file.file_name)}>Download</div>
  </div>
  <div className={`${DashCSS.element}`} onClick={() => setopenAreYouSure(openAreYouSure === file.id ? null : file.id)}>
    <div className={`${DashCSS.elementImg}`}>
    <svg
        className="lucide lucide-trash-2"
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2"
        stroke="#B74D67"
        fill="none"
        viewBox="0 0 24 24"
        height="24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        <line y2="17" y1="11" x2="10" x1="10"></line>
        <line y2="17" y1="11" x2="14" x1="14"></line>
      </svg>
    </div>
    <button className={`${DashCSS.elementText}`}>Delete</button>
  </div>
</div>
)}
{openShare === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
      <div className="w-full flex flex-row justify-center">
        <div>Share</div>
        <div className={`${DashCSS.infoExitImageDiv}`}>
<ul className="mb-4 mt-4 list-none space-x-1">
  <li className="inline-block text-left">
    <div
      className="relative mb-1 inline-block cursor-pointer select-none overflow-hidden whitespace-nowrap rounded p-2 text-center align-middle text-xs font-medium leading-5 tracking-wide text-slate-800 transition duration-300 ease-linear hover:text-blue-400 hover:shadow-2xl hover:shadow-blue-600"
      onClick={() => { setopenShare(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}
    >
      <span className="sr-only hidden">Twitter</span>
      <svg
        stroke="currentColor"
        fill="currentColor"
        aria-label="Twitter"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-8 w-8 fill-current"
      >
        <g>
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          ></path>
        </g>
      </svg>
    </div>
  </li>
</ul>
</div>
      </div>
    <div  className={`${DashCSS.infoNameAndImage}`}>
      <div className={DashCSS.infoCardImageDiv}>
      {file.file_type === "png" || file.file_type === "jpg" || file.file_type === "jpeg" ? (
            <img className={DashCSS.cardImage} src={'http://localhost:8000/storage/file_path/'+file.file_path} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'pdf' ? (
            <img className={DashCSS.cardImage} src={'/src/assets/pdf_svgrepo_com.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'docx' ? 
          ( <img className={DashCSS.cardImage} src={'/src/assets/download.jpeg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> 
            
          ): <img className={DashCSS.cardImage} src={'/src/assets/music.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> }
      </div>
      <div className={`${DashCSS.infoRightPart}`}>
        <div className={`${DashCSS.infoFileName}`}>{file.file_name}</div>
        <div className={`${DashCSS.infoFileDate}`}>{formatDate(file.created_at)}</div>
      </div>
    </div>
    <div className={`${DashCSS.sahreFileSentemce}`}>Share file with other users</div>
    <div className={`${DashCSS.emailSendDiv}`}>
    <input type="email" value={emailSend} onChange={handlEmaileChange}  id="email" className={`${DashCSS.emailInput}`}  placeholder={`Enter email address`} />
    </div>
    <div className={`${DashCSS.sureAndCancleDiv}`}>
      <div className={`${DashCSS.cancle}`}>
      <button className={`${DashCSS.cancleButton}`} onClick={() => {setopenShare(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}>Cancle</button>
      </div>
      <div className={`${DashCSS.sure}`}>
      <button className={`${DashCSS.sureButton}`} onClick={() => handleShare(file.file_path, file.file_name, emailSend, file.file_type, file.file_size)}>Share</button>
      </div>
    </div>
  </div>
)}
{openInfo === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
      <div className="w-full flex flex-row justify-center">
        <div>Details</div>
        <div className={`${DashCSS.infoExitImageDiv}`}>
<ul className="mb-4 mt-4 list-none space-x-1">
  <li className="inline-block text-left">
    <div
      className="relative mb-1 inline-block cursor-pointer select-none overflow-hidden whitespace-nowrap rounded p-2 text-center align-middle text-xs font-medium leading-5 tracking-wide text-slate-800 transition duration-300 ease-linear hover:text-blue-400 hover:shadow-2xl hover:shadow-blue-600"
      onClick={() => { setopenInfo(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}
    >
      <span className="sr-only hidden">Twitter</span>
      <svg
        stroke="currentColor"
        fill="currentColor"
        aria-label="Twitter"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-8 w-8 fill-current"
      >
        <g>
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          ></path>
        </g>
      </svg>
    </div>
  </li>
</ul>
</div>
      </div>
    <div  className={`${DashCSS.infoNameAndImage}`}>
      <div className={DashCSS.infoCardImageDiv}>
      {file.file_type === "png" || file.file_type === "jpg" || file.file_type === "jpeg" ? (
            <img className={DashCSS.cardImage} src={'http://localhost:8000/storage/file_path/'+file.file_path} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'pdf' ? (
            <img className={DashCSS.cardImage} src={'/src/assets/pdf_svgrepo_com.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'docx' ? 
          ( <img className={DashCSS.cardImage} src={'/src/assets/download.jpeg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> 
            
          ): <img className={DashCSS.cardImage} src={'/src/assets/music.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> }
      </div>
      <div className={`${DashCSS.infoRightPart}`}>
        <div className={`${DashCSS.infoFileName}`}>{file.file_name}</div>
        <div className={`${DashCSS.infoFileDate}`}>{formatDate(file.created_at)}</div>
      </div>
    </div>
    <div className={`${DashCSS.infoDetails}`}>
      <div className={`${DashCSS.infoDetailsCategoryPart}`}>
        <div className={`${DashCSS.infocategories}`}>Format:</div>
        <div className={`${DashCSS.infocategories}`}>Size:</div>
        <div className={`${DashCSS.infocategories}`}>Owner:</div>
        <div className={`${DashCSS.infocategories}`}>Last edited:</div>
      </div>
      <div className={`${DashCSS.infoDetailsCategoryPart}`}>
      <div className={`${DashCSS.infocategoriesValue}`}>{file.file_type}</div>
      <div className={`${DashCSS.infocategoriesValue}`}>{file.file_size<1024?  file.file_size+' KB': (Math.round(file.file_size / 1024 * 100) / 100)+' MB'}</div>
      <div className={`${DashCSS.infocategoriesValue}`}>{user?.username}</div>
      <div className={`${DashCSS.infocategoriesValue}`}>{formatDate(file.updated_at)}</div>
      </div>
    </div>
  </div>
)}
{openAreYouSureRename === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
    <div>Rename</div>
    <div  className={`${DashCSS.AreYouSureSentenceRename}`}><input type="text" value={rename} onChange={handleChange}  id="rename" className="w-full h-full border-2 border-black"  placeholder={`${file.file_name}`} /></div>
    <div className={`${DashCSS.sureAndCancleDiv}`}>
      <div className={`${DashCSS.cancle}`}>
      <button className={`${DashCSS.cancleButton}`} onClick={() => {setopenAreYouSureRename(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}>Cancle</button>
      </div>
      <div className={`${DashCSS.sure}`}>
      <button className={`${DashCSS.sureButton}`} onClick={() => changeName(file.id)}>Rename</button>
      </div>
    </div>
  </div>
)}
  {openAreYouSure === file.id && (
  <div
  // className={`${DashCSS.AreYouSure}`}
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    // padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: 1001, // Ensure it's above the overlay
    display: "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    paddingLeft:  "3rem",
    paddingRight: "3rem",
    paddingTop: "3rem",
    paddingBottom: "3rem",
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    borderBottomLeftRadius: "2rem",
    borderBottomRightRadius: "2rem",
    width: "43%"
  }}
>
    <div>Delete</div>
    <div  className={`${DashCSS.AreYouSureSentence}`}>Are you sure you want to delete <span className="text-red-600">{file.file_name}?</span></div>
    <div className={`${DashCSS.sureAndCancleDiv}`}>
      <div className={`${DashCSS.cancle}`}>
      <button className={`${DashCSS.cancleButton}`} onClick={() => {setopenAreYouSure(null); setOpenSettingsId(null); setOpenSearchedSettingsId(null)}}>Cancle</button>
      </div>
      <div className={`${DashCSS.sure}`}>
      <button className={`${DashCSS.sureButton}`} onClick={() => deleteFile(file.id)}>Delete</button>
      </div>
    </div>
  </div>
) }
      <div className={DashCSS.cardUpperPart}>
        <div className={DashCSS.cardImageDiv}>
          {/* You can render an image or icon based on the file type */}
          {file.file_type === "png" || file.file_type === "jpg" || file.file_type === "jpeg" ? (
            <img className={DashCSS.cardImage} src={'http://localhost:8000/storage/file_path/'+file.file_path} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'pdf' ? (
            <img className={DashCSS.cardImage} src={'/src/assets/pdf_svgrepo_com.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} />
          ) : file.file_type === 'docx' ? 
          ( <img className={DashCSS.cardImage} src={'/src/assets/download.jpeg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> 
            
          ): <img className={DashCSS.cardImage} src={'/src/assets/music.svg'} alt={"file.file_path"} onClick={() => window.open(`http://localhost:8000/storage/file_path/${file.file_path}`, '_blank')} /> }
        </div>
        <div className={DashCSS.cardSizeAndSettings}>
  <button className={DashCSS.button} onClick={() => setOpenSettingsId(openSettingsId === file.id ? null : file.id)}>
    <svg
      className={DashCSS.settings_btn}
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      fill="#e8eaed"
    >
      <path
        d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 ```html
99t99.5 41Zm-2-140Z"
      ></path>
    </svg>
    <span className={DashCSS.tooltip}>settings</span>
  </button>

          <div className={DashCSS.cardSize}>{file.file_size<1024?  file.file_size+' KB': (Math.round(file.file_size / 1024 * 100) / 100)+' MB'}</div>
        </div>
      </div>
      <div className={DashCSS.cardBottomPart}>
        <div className={DashCSS.cardFileName}>{file.file_name}</div>
        <div className={DashCSS.cardDate}>{formatDate(file.created_at)}</div> {/* Updated line */}
        <div className={DashCSS.cardUsername}>By {user?.username}</div>
      </div>
    </div>
  ))}
</div>
}
                  </div>
              </div>
            </div>
        </div>
    )
}