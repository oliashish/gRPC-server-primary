function processTask(task) {
    console.log("inside business logic");
    const wordCount = task.split(' ').length;
    const charCount = task.replace(/\s+/g, '').length;
    console.log(`Final count : ${wordCount} -  ${charCount}`);
    return { wordCount, charCount };
}