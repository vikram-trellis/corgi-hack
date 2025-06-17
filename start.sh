#!/bin/bash

# Create a new tmux session named 'monorepo'
tmux new-session -d -s monorepo -n frontend

# Configure first window for frontend
tmux send-keys -t monorepo:0 'cd /Users/vikramkhandelwal/corgi-hack/monorepo/frontend && pnpm dev' C-m

# Create a second window for backend
tmux new-window -t monorepo:1 -n backend

# Configure second window for backend
tmux send-keys -t monorepo:1 'cd /Users/vikramkhandelwal/corgi-hack/monorepo/backend && poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000' C-m

# Create a third window for ngrok
tmux new-window -t monorepo:2 -n ngrok

# Wait 5 seconds
tmux send-keys -t monorepo:2 'sleep 5' C-m

# Configure third window for ngrok (assuming backend runs on port 8000)
# Using fixed subdomain if available, otherwise standard ngrok
tmux send-keys -t monorepo:2 'ngrok http --url=earwig-striking-remotely.ngrok-free.app 8000' C-m

# Select the first window
tmux select-window -t monorepo:0

# Set status bar to show window name
tmux set -g status-left-length 50
tmux set -g status-left "#[fg=green]#S #[fg=yellow]#I:#P #[default]"
tmux set -g status-right "#[fg=green]#H"

# Attach to session
tmux attach-session -t monorepo

# Instructions for navigating:
# Press CTRL-b n to go to the next window
# Press CTRL-b p to go to the previous window
# Press CTRL-b 0 to go to window 0 (frontend)
# Press CTRL-b 1 to go to window 1 (backend)
# Press CTRL-b 2 to go to window 2 (ngrok)
# Press CTRL-b d to detach from the session (can be reattached with 'tmux attach -t monorepo')