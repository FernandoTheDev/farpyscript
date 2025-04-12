import io

new name: string = "Fernando"
new mut sum: int = 0

for new mut i: int = 0; i < name.length(); i++ {
    print(name.at(i))
}
for i = 0; i < 100; i++ {
    sum = sum + i
}

print(io.format("Sum = {sum}"))
