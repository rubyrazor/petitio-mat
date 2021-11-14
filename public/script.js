(function () {
    const signatureForm = $("#signature");
    const canvas = $("#canvas")[0];

    if (canvas) {
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

        $("#submitButton").click(() => {
            console.log("Submit was clicked.");
        });
    }

    // --------------------------- PETITIO-MAT ----------------------------
    let goodDeedsContainer = $("#good-deeds-container");

    if (false) {
        let top = goodDeedsContainer.position().top;
        let count = 0;
        let randomNumber = 300 + Math.floor(Math.random() * 90);

        function moveDeeds() {
            let goodDeeds = $(".good-deed");
            count++;
            if (count < randomNumber) {
                top = top - 4;
            } else if (count < randomNumber + 60) {
                top = top - 3;
            } else if (count < randomNumber + 120) {
                top = top - 2;
            } else {
                if (top === 0) {
                    return;
                }
                top = top - 1;
            }
            console.log(top);

            if (top <= -goodDeeds.eq(0).outerHeight()) {
                top += goodDeeds.eq(0).outerHeight();
                goodDeedsContainer.append(goodDeeds.eq(0));
            }
            goodDeedsContainer.css({
                top: top + "px",
            });

            requestAnimationFrame(moveDeeds);
        }
        moveDeeds();
    }

    // --------------------------- JINGLE-TICKER ----------------------------

//     let jingleTickerContainer = $("#jingle-ticker-container");

//     function moveJingle() {
//         let jingleText = $(".jingle-text");
//         let left = jingleText.offset().left;
//         left--;

//         console.log("Hello!");

//         if (left <= -jingleText.eq(0).outerWidth()) {
//             left += jingleText.eq(0).outerWidth();
//             jingleTickerContainer.append(jingleText.eq(0));
//         }
//         jingleText.css({
//             left: left + "px",
//         });
//         requestAnimationFrame(moveJingle);
//     }

//     moveJingle();
// })();
