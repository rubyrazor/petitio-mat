(function () {
    // --------------------------- CANVAS FOR SIGNATURE ----------------------------

    const canvas = $("#canvas")[0];

    if (canvas) {
        const signatureForm = $("#signature");
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "hotpink";
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
    }

    // --------------------------- PETITIO-MAT (SLOT MACHINE SPIN) ----------------------------
    let goodDeedsContainer = $("#good-deeds-container");
    let count = 0;

    $("#canvas-button").on("click", () => {
        moveDeeds();
        $("#helper-div4").css({
            display: "none",
        });
    });

    function moveDeeds() {
        let top = goodDeedsContainer.position().top;
        let randomNumber = 300 + Math.floor(Math.random() * 90);
        let goodDeeds = $(".good-deed");
        count++;

        if (count < randomNumber) {
            top = top - 35;
        } else if (count < randomNumber + 20) {
            top = top - 25;
        } else if (count < randomNumber + 40) {
            top = top - 20;
        } else if (count < randomNumber + 60) {
            top = top - 15;
        } else if (count < randomNumber + 80) {
            top = top - 10;
        } else if (count < randomNumber + 100) {
            top = top - 8;
        } else if (count < randomNumber + 120) {
            top = top - 2;
        } else {
            if (top === 0) {
                count = 0;
                return;
            }
            top = top - 1;
        }

        if (top <= -goodDeeds.eq(0).outerHeight()) {
            top += goodDeeds.eq(0).outerHeight();
            goodDeedsContainer.append(goodDeeds.eq(0));
        }

        goodDeedsContainer.css({
            top: top + "px",
        });

        requestAnimationFrame(moveDeeds);
    }
})();
