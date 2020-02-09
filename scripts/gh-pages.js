var ghpages = require('gh-pages');

ghpages.publish(
    '__sapper__/export/penrose-tiling',// <-- replace yourproject with your repo name
    {
        branch: 'gh-pages',
        repo: 'git@github.com:cimi/penrose-tiling.git',
        user: {
            name: 'Alex Ciminian',
            email: 'alex.ciminian@gmail.com'
        },
        message: "Auto-generated commit - deploy static site"
    },
    () => {
        console.log('Deploy Complete!')
    }
)
