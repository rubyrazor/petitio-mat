(function () {
    const signatureForm = $("#signature");
    const canvas = $("#canvas")[0];
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;

    $("#canvas").mousedown((e) => {
        ctx.moveTo(e.offsetX, e.offsetY);
        ctx.beginPath();

        $("#canvas").mousemove((e) => {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        });

        $("#canvas").mouseup(() => {
            signatureForm.val(canvas.toDataURL());
            $("#canvas").off("mousemove");
        });
    });

    $("#submitButton").click(() => {
        console.log("Submit-button was clicked.");
    });
})();
