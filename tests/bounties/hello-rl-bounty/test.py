import gymnasium as gym
import onnxruntime as ort
import numpy as np
import sys

# Load the FrozenLake environment
env = gym.make("FrozenLake-v1", render_mode="human")

# Load the ONNX model
model_path = sys.argv[1]  # Update this path

print(69)
