const packs = [
    {
        name: 'Exploring the Alps',
        price: 1.99,
        description: 'Three snow-bound alpine paintings in impasto style.',
        quantity: 5,
        label: 'New',
    },
    {
        name: 'Golden Hours In Monaco',
        price: 1.99,
        description: '',
        quantity: 3,
        label: 'Hot',
    },
]

const message = 'New pack: Exploring the Alps, $1.99';
const announce = document.querySelector('.announce');
announce.textContent = message;
announce.href = '#exploring-the-alps-pack';

const wallpaper = document.querySelector('.wallpaper-display');
let wallpapers = new Array();
packs.forEach(pack => {
    const NAME = pack.name;
    const QUANTITY = pack.quantity;
    for (let i = 0; i < QUANTITY; i++) {
        wallpapers.push(`./media/${NAME.toLowerCase()}/${i + 1}.png`);
    }
});
const ChangeWallpaper = () => {
    const rand = Math.floor(Math.random() * wallpapers.length)
    if(wallpaper.src !== wallpapers[ rand ]) {
        wallpaper.src = wallpapers[ rand ];
    }
    else ChangeWallpaper();
    // console.log(wallpaper.src);
}
ChangeWallpaper();
setInterval(ChangeWallpaper, 5000);

const catalog = document.querySelector('.catalog');
packs.forEach(pack => {
    const NAME = pack.name;
    const PRICE = pack.price;
    const DESCRIPTION = pack.description;
    const QUANTITY = pack.quantity;
    const LABEL = pack.label;

    let cards = '';
    for (let i = 1; i <= 3; i++) {
        cards += `
            <div class="card"><img src="./media/${NAME.toLowerCase()}/${i}.png" alt=""></div>
        `;
    }

    catalog.innerHTML += `
        <article class="pack" id="${NAME.toLowerCase().replace(/\s+/g, '-') + '-pack'}">
          <a class="stack" href="" aria-label="View Exploring the Alps">
            ${cards}
          </a>
          <div class="info">
            <h3><a href="">${NAME}</a> ${LABEL != '' ? `<span class="badge-${LABEL.toLowerCase()}">${LABEL}</span>` : ''}</h3>
            <p>${DESCRIPTION}</p>
            <div class="get-row">
              <button class="btn" type="button" data-get>Get</button>
              <span class="price">$${PRICE.toFixed(2)}</span>
            </div>
          </div>
        </article>
    `
})