const SUPABASE_URL = "https://dtkeirqxclbcihlekmfd.supabase.co";
const SUPABASE_KEY = "sb_publishable_y0t0VrPMucxvlRvGQzERWw_cFqNBn2S";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const login =
    document.getElementById("login");

const bilderSide =
    document.getElementById("bilderSide");

const epost =
    document.getElementById("epost");

const passord =
    document.getElementById("passord");

const loginKnapp =
    document.getElementById("loginKnapp");

const loginMelding =
    document.getElementById("loginMelding");

const bilder =
    document.getElementById("bilder");

const loggUt =
    document.getElementById("loggUt");


sjekkInnlogging();


async function sjekkInnlogging() {

    const { data } =
        await supabaseClient.auth.getSession();


    if (data.session) {

        visAdmin();

    }
}


loginKnapp.addEventListener(
    "click",
    async function() {

        loginMelding.textContent =
            "Logger inn...";


        const email =
            epost.value;

        const password =
            passord.value;


        const { data, error } =
            await supabaseClient
            .auth
            .signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error(error);

            loginMelding.textContent =
                "Feil e-post eller passord.";

            return;
        }


        visAdmin();

    }
);


function visAdmin() {

    login.classList.add("skjult");

    bilderSide.classList.remove("skjult");

    hentBilder();
}


async function hentBilder() {

    bilder.innerHTML =
        "<p>Laster bilder...</p>";


    const { data, error } =
        await supabaseClient
        .storage
        .from("bilder")
        .list();


    if (error) {

        console.error(error);

        bilder.innerHTML =
            "<p>Kunne ikke hente bildene.</p>";

        return;
    }


    bilder.innerHTML = "";


    if (!data || data.length === 0) {

        bilder.innerHTML =
            "<p>Ingen bilder enda.</p>";

        return;
    }


    data.sort(function(a, b) {

        return new Date(b.created_at)
            - new Date(a.created_at);

    });


    for (const fil of data) {

        await visBilde(fil);

    }
}


async function visBilde(fil) {

    const { data, error } =
        await supabaseClient
        .storage
        .from("bilder")
        .createSignedUrl(
            fil.name,
            3600
        );


    if (error) {

        console.error(error);

        return;
    }


    const kort =
        document.createElement("div");

    kort.className =
        "bilde-kort";


    const bilde =
        document.createElement("img");

    bilde.src =
        data.signedUrl;


    const slett =
        document.createElement("button");

    slett.className =
        "slett-knapp";

    slett.textContent =
        "🗑️ Slett";


    slett.addEventListener(
        "click",
        function() {

            slettBilde(fil.name);

        }
    );


    kort.appendChild(bilde);

    kort.appendChild(slett);

    bilder.appendChild(kort);
}


async function slettBilde(filnavn) {

    const bekreft =
        confirm(
            "Vil du slette dette bildet?"
        );


    if (!bekreft) {
        return;
    }


    const { error } =
        await supabaseClient
        .storage
        .from("bilder")
        .remove([filnavn]);


    if (error) {

        console.error(error);

        alert(
            "Kunne ikke slette bildet."
        );

        return;
    }


    hentBilder();
}


loggUt.addEventListener(
    "click",
    async function() {

        await supabaseClient
        .auth
        .signOut();

        location.reload();

    }
);
