require 'test_helper'

class DiaSemanasControllerTest < ActionController::TestCase
  setup do
    @dia_semana = dia_semanas(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:dia_semanas)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create dia_semana" do
    assert_difference('DiaSemana.count') do
      post :create, dia_semana: @dia_semana.attributes
    end

    assert_redirected_to dia_semana_path(assigns(:dia_semana))
  end

  test "should show dia_semana" do
    get :show, id: @dia_semana
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @dia_semana
    assert_response :success
  end

  test "should update dia_semana" do
    put :update, id: @dia_semana, dia_semana: @dia_semana.attributes
    assert_redirected_to dia_semana_path(assigns(:dia_semana))
  end

  test "should destroy dia_semana" do
    assert_difference('DiaSemana.count', -1) do
      delete :destroy, id: @dia_semana
    end

    assert_redirected_to dia_semanas_path
  end
end
