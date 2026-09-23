const SUPABASE_URL = "https://dtkeirqxclbcihlekmfd.supabase.co";
const SUPABASE_KEY = "sb_publishable_y0t0VrPMucxvlRvGQzERWw_cFqNBn2S";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const video = document.getElementById("kamera");
const canvas = document.getElementById("bilde");
const melding = document.getElementById("melding");

navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: "user"
    },
    audio: false
})
.then(function(stream) {

    video.srcObject = stream;

    video.onloadedmetadata = function() {

        melding.textContent =
            "Bildet tas automatisk om 2 sekunder...";

        setTimeout(function() {
            taBilde();
        }, 2000);
    };

})
.catch(function(error) {

    console.error(error);

    melding.textContent =
        "Du må tillate tilgang til kameraet.";

});


function taBilde() {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob(function(blob) {

        lastOppBilde(blob);

    }, "image/jpeg", 0.9);
}


async function lastOppBilde(blob) {

    melding.textContent = "Lagrer bildet...";

    const filnavn =
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2) +
        ".jpg";


    const { data, error } =
        await supabaseClient
        .storage
        .from("bilder")
        .upload(
            filnavn,
            blob,
            {
                contentType: "image/jpeg",
                upsert: false
            }
        );


    if (error) {

        console.error(error);

        melding.textContent =
            "Noe gikk galt.";

        return;
    }


    console.log("Bilde lagret:", data);


    if (video.srcObject) {

        const tracks =
            video.srcObject.getTracks();

        tracks.forEach(function(track) {
            track.stop();
        });
    }


    video.classList.add("skjult");

    melding.textContent = "Takk!";
}
