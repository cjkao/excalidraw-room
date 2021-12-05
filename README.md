# Excalidraw Portal

Collaboration server for Excalidraw

# Development

- install

  ```sh
  yarn
  ```

- run development server

  ```sh
  yarn start:dev
  ```

# Deployment

NOTE: currently the server IS NOT deployed automatically on push to the `master` branch, and must be done so manually by an admin.
# docker
docker build . -t room:v1
docker build . -f Dockerfile.nomem -t room:v0
docker run -m=128m -it  -rm  --memory-swappiness=0 room:v1 -p 3002:3002
docker run -m=256m -e NODE_ENV="--optimize_for_size=true --gc_interval=100 --max_old_space_size=24"  --memory-swappiness=0  -p 3002:3002 room:v1
#ENV NODE_ENV="--optimize-for-size=true --gc_interval=50 --trace-gc --log-gc"


# load test
alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"

chrome --headless --disable-gpu --remote-debugging-port=9222 http://localhost:3001/#room=20e0ea67c91255335c3d,OeCa5u9fUnpXJpziEig3VQ 


 chrome --headless --disable-gpu --remote-debugging-port=9222 http://localhost:3001/#room=98bb4e23b26d68bf67be,ug_aaVN7yuX8DqwmBzhSiw


calc mem
kb=$(ps aux | grep -v grep | grep -v 'ps aux' | grep -v bash | grep -v awk | grep -v RSS | awk '{print $6}' | awk '{s+=$1} END {printf "%.0f", s}'); mb=$(expr $kb / 1024); printf "Kb: $kb\nMb: $mb\n"


ps aux | awk '{print $2}' | grep -v PID | xargs pmap -x | grep total | grep -v grep | awk '{print $3}' | awk '{s+=$1} END {printf "%.0f", s}'; echo
