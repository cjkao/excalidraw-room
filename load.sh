#!/bin/zsh
source ~/.zshrc

for i in  {1..50}
do
	echo "Loading client $i"
	chrome --headless --disable-gpu --remote-debugging-port=9222 http://localhost:3001/#room=f0b81729849549dee0d9,W1qfGk8yH5rg5oXQRS2ZPw &
done