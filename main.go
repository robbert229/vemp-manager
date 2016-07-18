package main

import (
	"log"
	"net/http"
	"os/exec"
	"path"
	"strings"

	"encoding/json"

	"bytes"

	"github.com/gorilla/mux"
	"github.com/pkg/errors"
)

const (
	isntRunningString = "INFO: No tasks are running which match the specified criteria."
	nginxRoot         = "./instances/nginx-1.11.2/"
)

func nginxIsRunningWindows() (bool, error) {
	// tasklist /fi
	c := exec.Command("tasklist", "/fi", "imagename eq nginx.exe")

	buffer := bytes.NewBuffer(nil)

	c.Stdout = buffer

	if err := c.Start(); err != nil {
		return false, errors.Wrap(err, "Failed to start command")
	}
	err := c.Wait()
	if err != nil {
		return false, errors.Wrap(err, "Failed to wait command")
	}

	stringOutput := string(buffer.String())

	if strings.Contains(stringOutput, isntRunningString) {
		return false, nil
	}

	return true, nil
}

func nginxReloadWindows() error {
	nginx := path.Join(nginxRoot, "nginx.exe")
	c := exec.Command(nginx, "-s", "reload", "-p", nginxRoot)
	if err := c.Run(); err != nil {
		return errors.Wrap(err, "Failed to reload server - "+strings.Join(c.Args, " "))
	}

	return nil
}

func nginxStopWindows() error {
	isRunning, err := nginxIsRunningWindows()
	if err != nil {
		return errors.Wrap(err, "Failed to check if server is running")
	}

	if !isRunning {
		return errors.New("Server is not running")
	}

	nginx := path.Join(nginxRoot, "nginx.exe")
	c := exec.Command(nginx, "-s", "quit", "-p", nginxRoot)
	if err := c.Run(); err != nil {
		return errors.Wrap(err, "Failed to stop server - "+strings.Join(c.Args, " "))
	}

	return nil
}

func nginxStartWindows() error {
	isRunning, err := nginxIsRunningWindows()
	if err != nil {
		return errors.Wrap(err, "Failed to check if server is running")
	}

	if isRunning {
		return errors.New("Server is already running")
	}

	nginx := path.Join(nginxRoot, "nginx.exe")
	c := exec.Command(nginx, "-p", nginxRoot)
	if err := c.Start(); err != nil {
		return errors.Wrap(err, "Failed to start server - "+strings.Join(c.Args, " "))
	}

	return nil
}

type nginxStatusData struct {
	IsRunning bool
}

func nginxStatus(w http.ResponseWriter, r *http.Request) {
	isRunning, err := nginxIsRunningWindows()

	if err != nil {
		log.Println(err)
	}

	result := &nginxStatusData{
		IsRunning: isRunning,
	}

	data, err := json.Marshal(result)
	if err != nil {
		log.Println(err)
	}
	w.Write(data)
}

type nginxStopData struct {
	Error   string
	Success bool
}

func nginxStop(w http.ResponseWriter, r *http.Request) {
	err := nginxStopWindows()

	errorString := ""
	if err != nil {
		errorString = err.Error()
	}

	result := &nginxStopData{
		Error:   errorString,
		Success: (err == nil),
	}

	data, err := json.Marshal(result)
	if err != nil {
		log.Println(err)
	}
	w.Write(data)
}

func nginxStart(w http.ResponseWriter, r *http.Request) {
	err := nginxStartWindows()

	errorString := ""
	if err != nil {
		errorString = err.Error()
	}

	result := &nginxStopData{
		Error:   errorString,
		Success: (err == nil),
	}

	data, err := json.Marshal(result)
	if err != nil {
		log.Println(err)
	}

	w.Write(data)
}

func main() {
	/*fmt.Println("Hello, World!")
	hosts, err := goodhosts.NewHosts()

	if err != nil {
		log.Fatal(err)
	}

	if !hosts.Has("127.0.0.1", "dev.foo.com") {
		hosts.Add("127.0.0.1", "dev.foo.com")
		err := hosts.Flush()
		if err != nil {
			log.Fatal(err)
		}
	}*/

	r := mux.NewRouter()

	r.HandleFunc("/nginx/status", nginxStatus)
	r.HandleFunc("/nginx/stop", nginxStop)
	r.HandleFunc("/nginx/start", nginxStart)

	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))

	panic(http.ListenAndServe(":8080", r))
}
