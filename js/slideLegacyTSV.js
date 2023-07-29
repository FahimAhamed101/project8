$(document).ready(() => {
    $('.slidedown-link').click(e => {
      e.preventDefault()
      $(e.target.nextSibling).css('display') === 'none'
        ? $(e.target.nextSibling).slideDown()
        : $(e.target.nextSibling).slideUp()
    })
  })