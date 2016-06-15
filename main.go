package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	dir, _ := os.Getwd()
	fs := http.FileServer(http.Dir(dir))
	http.Handle("/", fs)
	http.HandleFunc("/public/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "public/index.js")
	})
	log.Println("Serving " + dir)
	http.ListenAndServe(":8080", nil)
}
